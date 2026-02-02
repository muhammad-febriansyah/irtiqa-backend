<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MessageResource;
use App\Http\Resources\ProgramResource;
use App\Http\Resources\SessionScheduleResource;
use App\Models\Message;
use App\Models\Program;
use App\Models\Rating;
use App\Models\SessionSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProgramController extends Controller
{
    /**
     * Get list of user's programs
     */
    public function index(Request $request): JsonResponse
    {
        $programs = Program::with(['consultant.user', 'package'])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => ProgramResource::collection($programs),
            'meta' => [
                'current_page' => $programs->currentPage(),
                'last_page' => $programs->lastPage(),
                'per_page' => $programs->perPage(),
                'total' => $programs->total(),
            ],
        ]);
    }

    /**
     * Create new program
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'package_id' => ['required', 'exists:packages,id'],
            'consultant_id' => ['required', 'exists:consultants,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'goals' => ['sometimes', 'array'],
        ]);

        $program = Program::create([
            'user_id' => $request->user()->id,
            'package_id' => $request->package_id,
            'consultant_id' => $request->consultant_id,
            'title' => $request->title,
            'description' => $request->description,
            'goals' => $request->goals ?? [],
            'status' => 'pending',
            'start_date' => now(),
        ]);

        $program->load(['consultant.user', 'package']);

        return response()->json([
            'success' => true,
            'message' => 'Program created successfully',
            'data' => new ProgramResource($program),
        ], 201);
    }

    /**
     * Get program details
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $program = Program::with(['consultant.user', 'package', 'sessions'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new ProgramResource($program),
        ]);
    }

    /**
     * Update program
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $program = Program::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'goals' => ['sometimes', 'array'],
        ]);

        $program->update($request->only(['title', 'description', 'goals']));
        $program->load(['consultant.user', 'package']);

        return response()->json([
            'success' => true,
            'message' => 'Program updated successfully',
            'data' => new ProgramResource($program),
        ]);
    }

    /**
     * Create session schedule
     */
    public function createSession(Request $request, int $id): JsonResponse
    {
        $program = Program::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'agenda' => ['sometimes', 'string'],
            'scheduled_at' => ['required', 'date', 'after:now'],
            'duration_minutes' => ['required', 'integer', 'min:15'],
            'meeting_link' => ['sometimes', 'url'],
            'meeting_platform' => ['sometimes', 'string'],
        ]);

        $sessionNumber = $program->sessions()->count() + 1;

        $session = SessionSchedule::create([
            'program_id' => $program->id,
            'session_number' => $sessionNumber,
            'title' => $request->title,
            'agenda' => $request->agenda,
            'scheduled_at' => $request->scheduled_at,
            'duration_minutes' => $request->duration_minutes,
            'meeting_link' => $request->meeting_link,
            'meeting_platform' => $request->meeting_platform,
            'status' => 'scheduled',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Session created successfully',
            'data' => new SessionScheduleResource($session),
        ], 201);
    }

    /**
     * Get program sessions
     */
    public function getSessions(Request $request, int $id): JsonResponse
    {
        $program = Program::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $sessions = $program->sessions()
            ->orderBy('session_number', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => SessionScheduleResource::collection($sessions),
        ]);
    }

    /**
     * Update session
     */
    public function updateSession(Request $request, int $sessionId): JsonResponse
    {
        $session = SessionSchedule::whereHas('program', function ($q) use ($request) {
            $q->where('user_id', $request->user()->id);
        })->findOrFail($sessionId);

        $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'agenda' => ['sometimes', 'string'],
            'scheduled_at' => ['sometimes', 'date'],
            'notes' => ['sometimes', 'string'],
            'homework' => ['sometimes', 'string'],
            'status' => ['sometimes', 'in:scheduled,in_progress,completed,cancelled'],
        ]);

        $session->update($request->only([
            'title',
            'agenda',
            'scheduled_at',
            'notes',
            'homework',
            'status',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Session updated successfully',
            'data' => new SessionScheduleResource($session),
        ]);
    }

    /**
     * Send message in program
     */
    public function sendMessage(Request $request, int $id): JsonResponse
    {
        $program = Program::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $request->validate([
            'content' => ['required', 'string'],
        ]);

        $message = Message::create([
            'messageable_type' => Program::class,
            'messageable_id' => $program->id,
            'sender_id' => $request->user()->id,
            'recipient_id' => $program->consultant_id,
            'content' => $request->content,
        ]);

        $message->load(['sender', 'recipient']);

        return response()->json([
            'success' => true,
            'message' => 'Message sent successfully',
            'data' => new MessageResource($message),
        ], 201);
    }

    /**
     * Get program messages
     */
    public function getMessages(Request $request, int $id): JsonResponse
    {
        $program = Program::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $messages = Message::with(['sender', 'recipient'])
            ->where('messageable_type', Program::class)
            ->where('messageable_id', $program->id)
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark messages as read
        Message::where('messageable_type', Program::class)
            ->where('messageable_id', $program->id)
            ->where('recipient_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'data' => MessageResource::collection($messages),
        ]);
    }

    /**
     * Complete program
     */
    public function complete(Request $request, int $id): JsonResponse
    {
        $program = Program::where('user_id', $request->user()->id)
            ->where('status', 'in_progress')
            ->findOrFail($id);

        $program->update([
            'status' => 'completed',
            'completed_at' => now(),
            'progress_percentage' => 100,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Program completed successfully',
        ]);
    }

    /**
     * Rate program
     */
    public function rate(Request $request, int $id): JsonResponse
    {
        $program = Program::where('user_id', $request->user()->id)
            ->where('status', 'completed')
            ->findOrFail($id);

        $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'communication_rating' => ['sometimes', 'integer', 'min:1', 'max:5'],
            'professionalism_rating' => ['sometimes', 'integer', 'min:1', 'max:5'],
            'knowledge_rating' => ['sometimes', 'integer', 'min:1', 'max:5'],
            'helpfulness_rating' => ['sometimes', 'integer', 'min:1', 'max:5'],
            'review' => ['sometimes', 'string', 'max:1000'],
        ]);

        $rating = Rating::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'rateable_type' => Program::class,
                'rateable_id' => $program->id,
            ],
            [
                'consultant_id' => $program->consultant_id,
                'rating' => $request->rating,
                'communication_rating' => $request->communication_rating ?? $request->rating,
                'professionalism_rating' => $request->professionalism_rating ?? $request->rating,
                'knowledge_rating' => $request->knowledge_rating ?? $request->rating,
                'helpfulness_rating' => $request->helpfulness_rating ?? $request->rating,
                'review' => $request->review,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Rating submitted successfully',
        ]);
    }
}
