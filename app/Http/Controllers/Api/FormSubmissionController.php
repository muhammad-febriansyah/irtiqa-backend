<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FormSubmissionResource;
use App\Models\FormSubmission;
use App\Models\FormTemplate;
use App\Models\ConsultationTicket;
use App\Services\ConsultantRoutingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class FormSubmissionController extends Controller
{
    protected $routingService;

    public function __construct(ConsultantRoutingService $routingService)
    {
        $this->routingService = $routingService;
    }

    /**
     * Submit a form and create consultation ticket
     */
    public function submit(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'form_template_id' => 'required|exists:form_templates,id',
            'category_id' => 'required|exists:consultation_categories,id',
            'subject' => 'required|string|max:255',
            'problem_description' => 'required|string',
            'answers' => 'required|array',
            'answers.*.form_field_id' => 'required|exists:form_fields,id',
            'answers.*.answer_value' => 'required',
            'answers.*.explanation' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();
        try {
            $user = $request->user();
            $template = FormTemplate::findOrFail($request->form_template_id);

            // Create form submission
            $submission = FormSubmission::create([
                'form_template_id' => $template->id,
                'user_id' => $user->id,
                'submitted_at' => now(),
            ]);

            // Store answers
            foreach ($request->answers as $answerData) {
                $answer = $submission->answers()->create([
                    'form_field_id' => $answerData['form_field_id'],
                    'answer_value' => $answerData['answer_value'],
                    'explanation' => $answerData['explanation'] ?? null,
                ]);

                // Calculate risk score for this answer
                $answer->calculateRiskScore();
            }

            // Calculate total risk score
            $submission->load('answers.field');
            $submission->calculateRiskScore();

            // Create consultation ticket
            $ticket = ConsultationTicket::create([
                'user_id' => $user->id,
                'category_id' => $request->category_id,
                'form_submission_id' => $submission->id,
                'subject' => $request->subject,
                'problem_description' => $request->problem_description,
                'status' => 'waiting',
            ]);

            // Auto-assign consultant using smart routing
            $consultant = $this->routingService->assignConsultant($ticket, $submission);

            if (!$consultant) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'No available consultant found. Please try again later.',
                ], 503);
            }

            // Update submission with ticket reference
            $submission->update(['consultation_ticket_id' => $ticket->id]);

            DB::commit();

            // Load relationships for response
            $submission->load(['template', 'user', 'consultationTicket', 'answers.field']);

            return response()->json([
                'success' => true,
                'message' => 'Form submitted successfully. You have been assigned to a consultant.',
                'data' => [
                    'submission' => new FormSubmissionResource($submission),
                    'ticket' => [
                        'id' => $ticket->id,
                        'ticket_number' => $ticket->ticket_number,
                        'status' => $ticket->status,
                        'consultant' => [
                            'id' => $consultant->id,
                            'name' => $consultant->user->name,
                            'level' => $consultant->level,
                            'specialist_category' => $consultant->specialist_category,
                        ],
                        'routing_score' => $ticket->routing_score,
                    ],
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit form: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get user's form submissions
     */
    public function mySubmissions(Request $request)
    {
        $user = $request->user();

        $submissions = FormSubmission::with(['template', 'answers.field', 'consultationTicket'])
            ->where('user_id', $user->id)
            ->orderBy('submitted_at', 'desc')
            ->paginate(15);

        return FormSubmissionResource::collection($submissions);
    }

    /**
     * Get specific submission
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $submission = FormSubmission::with(['template', 'user', 'answers.field', 'consultationTicket'])
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new FormSubmissionResource($submission),
        ]);
    }

    /**
     * Get submissions for a ticket (for consultants)
     */
    public function getByTicket(Request $request, $ticketId)
    {
        $ticket = ConsultationTicket::findOrFail($ticketId);

        // Check if user is consultant for this ticket
        $user = $request->user();
        if (!$ticket->isConsultantOrAdmin($user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        $submissions = FormSubmission::with(['template', 'user', 'answers.field'])
            ->where('consultation_ticket_id', $ticketId)
            ->orderBy('submitted_at', 'desc')
            ->get();

        return FormSubmissionResource::collection($submissions);
    }

    /**
     * Get risk statistics (for admin/analytics)
     */
    public function riskStatistics(Request $request)
    {
        // Check if user is admin
        if (!$request->user()->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        $stats = [
            'total_submissions' => FormSubmission::count(),
            'by_risk_level' => [
                'critical' => FormSubmission::critical()->count(),
                'high' => FormSubmission::where('risk_level', 'high')->count(),
                'medium' => FormSubmission::where('risk_level', 'medium')->count(),
                'low' => FormSubmission::where('risk_level', 'low')->count(),
            ],
            'average_risk_score' => FormSubmission::avg('total_risk_score'),
            'recent_critical' => FormSubmission::with(['user', 'consultationTicket'])
                ->critical()
                ->orderBy('submitted_at', 'desc')
                ->take(10)
                ->get()
                ->map(function ($submission) {
                    return [
                        'id' => $submission->id,
                        'user_name' => $submission->user->name,
                        'risk_score' => $submission->total_risk_score,
                        'ticket_status' => $submission->consultationTicket->status ?? null,
                        'submitted_at' => $submission->submitted_at->toISOString(),
                    ];
                }),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
