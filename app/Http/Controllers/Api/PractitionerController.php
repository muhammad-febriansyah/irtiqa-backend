<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PractitionerResource;
use App\Models\Practitioner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PractitionerController extends Controller
{
    /**
     * Get list of practitioners
     */
    public function index(Request $request): JsonResponse
    {
        $query = Practitioner::where('is_verified', true)
            ->where('is_active', true);

        // Filter by specialization
        if ($request->has('specialization')) {
            $query->where('specialization', 'like', '%' . $request->specialization . '%');
        }

        // Filter by location
        if ($request->has('province')) {
            $query->where('province', $request->province);
        }

        if ($request->has('city')) {
            $query->where('city', $request->city);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('specialization', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $practitioners = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data' => PractitionerResource::collection($practitioners),
            'meta' => [
                'current_page' => $practitioners->currentPage(),
                'last_page' => $practitioners->lastPage(),
                'per_page' => $practitioners->perPage(),
                'total' => $practitioners->total(),
            ],
        ]);
    }

    /**
     * Get practitioner details
     */
    public function show(int $id): JsonResponse
    {
        $practitioner = Practitioner::where('is_verified', true)
            ->where('is_active', true)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new PractitionerResource($practitioner),
        ]);
    }
}
