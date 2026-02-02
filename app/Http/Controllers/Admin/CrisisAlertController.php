<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CrisisAlert;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CrisisAlertController extends Controller
{
    /**
     * Display a listing of crisis alerts
     */
    public function index(Request $request)
    {
        $query = CrisisAlert::with(['user', 'ticket', 'assignedToAdmin'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by severity
        if ($request->filled('severity')) {
            $query->where('severity', $request->severity);
        }

        // Search by user name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $alerts = $query->paginate($request->get('per_page', 20));

        // Transform data for frontend
        $alerts->getCollection()->transform(function ($alert) {
            return [
                'id' => $alert->id,
                'user_name' => $alert->user->name ?? 'Unknown',
                'alert_type' => $alert->alert_type,
                'alert_type_label' => $this->getAlertTypeLabel($alert->alert_type),
                'severity' => $alert->severity,
                'severity_label' => ucfirst($alert->severity),
                'status' => $alert->status,
                'status_label' => ucfirst($alert->status),
                'assigned_admin_name' => $alert->assignedToAdmin->name ?? null,
                'created_at' => $alert->created_at->format('d M Y H:i'),
                'acknowledged_at' => $alert->acknowledged_at?->format('d M Y H:i'),
                'resolved_at' => $alert->resolved_at?->format('d M Y H:i'),
                'context' => $alert->context,
                'detected_keywords' => $alert->detected_keywords,
                'notes' => $alert->notes,
            ];
        });

        return Inertia::render('admin/crisis-alerts/index', [
            'alerts' => $alerts,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'severity' => $request->severity,
            ],
        ]);
    }

    /**
     * Display the specified crisis alert
     */
    public function show(CrisisAlert $crisisAlert)
    {
        $crisisAlert->load(['user', 'ticket', 'assignedToAdmin']);

        return Inertia::render('admin/crisis-alerts/show', [
            'alert' => [
                'id' => $crisisAlert->id,
                'user_name' => $crisisAlert->user->name ?? 'Unknown',
                'user_email' => $crisisAlert->user->email ?? null,
                'user_phone' => $crisisAlert->user->phone ?? null,
                'alert_type' => $crisisAlert->alert_type,
                'alert_type_label' => $this->getAlertTypeLabel($crisisAlert->alert_type),
                'severity' => $crisisAlert->severity,
                'severity_label' => ucfirst($crisisAlert->severity),
                'status' => $crisisAlert->status,
                'status_label' => ucfirst($crisisAlert->status),
                'assigned_admin_name' => $crisisAlert->assignedToAdmin->name ?? null,
                'context' => $crisisAlert->context,
                'detected_keywords' => $crisisAlert->detected_keywords,
                'notes' => $crisisAlert->notes,
                'ticket_number' => $crisisAlert->ticket->ticket_number ?? null,
                'created_at' => $crisisAlert->created_at->format('d M Y H:i'),
                'acknowledged_at' => $crisisAlert->acknowledged_at?->format('d M Y H:i'),
                'resolved_at' => $crisisAlert->resolved_at?->format('d M Y H:i'),
            ],
        ]);
    }

    /**
     * Acknowledge a crisis alert
     */
    public function acknowledge(Request $request, CrisisAlert $crisisAlert)
    {
        if ($crisisAlert->status !== 'pending') {
            return back()->with('error', 'Alert sudah diproses sebelumnya');
        }

        $crisisAlert->acknowledge($request->user()->id);

        return back()->with('success', 'Crisis alert berhasil di-acknowledge');
    }

    /**
     * Resolve a crisis alert
     */
    public function resolve(Request $request, CrisisAlert $crisisAlert)
    {
        $request->validate([
            'notes' => 'required|string|max:1000',
        ]);

        if ($crisisAlert->status === 'resolved') {
            return back()->with('error', 'Alert sudah resolved');
        }

        $crisisAlert->resolve($request->notes);

        return back()->with('success', 'Crisis alert berhasil di-resolve');
    }

    /**
     * Get alert type label
     */
    private function getAlertTypeLabel(string $type): string
    {
        return match ($type) {
            'manual_panic' => 'Manual Panic Button',
            'keyword_detection' => 'Keyword Detection',
            'auto_escalation' => 'Auto Escalation',
            default => ucfirst(str_replace('_', ' ', $type)),
        };
    }
}
