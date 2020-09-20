<?php

namespace App\Http\Controllers\Api;

use App\Models\Video;
use DB;
use Illuminate\Http\Request;

class VideoController extends BasicCrudController
{
    private array $rules;

    public function __construct()
    {
        $this->rules = [
            'title' => 'required|max:255',
            'description' => 'required',
            'year_launched' => 'required|date_format:Y',
            'opened' => 'boolean',
            'rating' => 'required|in:' . implode(',', Video::RATING_LIST),
            'duration' => 'required|integer',
            'categories_id' => 'required|array|exists:categories,id',
            'genres_id' => 'required|array|exists:genres,id',
        ];
    }

    public function store(Request $request)
    {
        return DB::transaction(function () use ($request) {
            $validatedData = $this->validate($request, $this->rulesStore());
            /** @var Video $video */
            $video = $this->model()::create($validatedData);
            $this->handleRelations($video, $request);
            $video->refresh();

            return $video;
        });
    }

    public function update(Request $request, $id)
    {
        /** @var Video $video */
        $video = $this->findOrFail($id);
        return DB::transaction(function () use ($request, $video) {
            $validatedData = $this->validate($request, $this->rulesUpdate());
            $video->update($validatedData);
            $this->handleRelations($video, $request);

            return $video;
        });
    }

    protected function handleRelations(Video $video, Request $request)
    {
        $video->categories()->sync($request->input('categories_id'));
        $video->genres()->sync($request->input('genres_id'));
    }

    protected function model(): string
    {
        return Video::class;
    }

    protected function rulesStore(): array
    {
        return $this->rules;
    }

    protected function rulesUpdate(): array
    {
        return $this->rules;
    }
}
