<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PackageResource;
use App\Models\Package;
use Illuminate\Http\JsonResponse;

class PackageController extends Controller
{
    /**
     * Get list of packages
     */
    public function index(): JsonResponse
    {
        $packages = Package::where('is_active', true)
            ->orderBy('is_featured', 'desc')
            ->orderBy('price', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => PackageResource::collection($packages),
        ]);
    }

    /**
     * Get package details
     */
    public function show(int $id): JsonResponse
    {
        $package = Package::where('is_active', true)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new PackageResource($package),
        ]);
    }
}
