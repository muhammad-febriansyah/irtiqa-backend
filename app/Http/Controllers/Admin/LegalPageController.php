<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LegalPage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LegalPageController extends Controller
{
    /**
     * Display the form for editing a specific legal page.
     */
    public function edit(string $slug)
    {
        $legalPage = LegalPage::where('slug', $slug)->firstOrFail();

        return Inertia::render('admin/legal/edit', [
            'legalPage' => $legalPage,
        ]);
    }

    /**
     * Update a specific legal page content.
     */
    public function update(Request $request, string $slug)
    {
        $legalPage = LegalPage::where('slug', $slug)->firstOrFail();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $legalPage->update($validated);

        return back()->with('success', "{$legalPage->title} berhasil diperbarui");
    }
}
