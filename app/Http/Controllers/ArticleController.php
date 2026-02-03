<?php

namespace App\Http\Controllers;

use App\Models\EducationalContent;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $articles = EducationalContent::published()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('content', 'like', "%{$search}%")
                        ->orWhere('excerpt', 'like', "%{$search}%");
                });
            })
            ->latest('published_at')
            ->paginate(6)
            ->withQueryString();

        $logo = SystemSetting::get('logo');

        return Inertia::render('Articles/Index', [
            'articles' => $articles,
            'filters' => [
                'search' => $search,
            ],
            'logo' => $logo ? (str_starts_with($logo, 'http') ? $logo : '/storage/' . $logo) : null,
        ]);
    }

    public function show($slug)
    {
        $article = EducationalContent::published()
            ->where('slug', $slug)
            ->firstOrFail();

        $article->incrementViews();

        $logo = SystemSetting::get('logo');

        return Inertia::render('Articles/Show', [
            'article' => $article,
            'logo' => $logo ? (str_starts_with($logo, 'http') ? $logo : '/storage/' . $logo) : null,
        ]);
    }
}
