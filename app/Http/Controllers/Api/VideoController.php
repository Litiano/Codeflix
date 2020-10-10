<?php

namespace App\Http\Controllers\Api;

use App\Models\Video;
use App\Rules\GenresHasCategoriesRule;
use DB;
use Illuminate\Http\Request;

class VideoController extends BasicCrudController
{
    private array $rules;

    public function __construct()
    {
        $this->rules = [
            'title' => ['required', 'max:255'],
            'description' => 'required',
            'year_launched' => ['required', 'date_format:Y'],
            'opened' => 'boolean',
            'rating' => ['required', 'in:' . implode(',', Video::RATING_LIST)],
            'duration' => ['required', 'integer'],
            'categories_id' => ['required', 'array', 'exists:App\Models\Category,id,deleted_at,NULL'],
            'genres_id' => ['required', 'array', 'exists:App\Models\Genre,id,deleted_at,NULL'],
            'video_file' => ['mimetypes:video/mp4', 'max:5120'], //5Mb
        ];
    }

    public function store(Request $request)
    {
        $this->addRulesIfGenresHasCategories($request);
        $validatedData = $this->validate($request, $this->rulesStore());
        /** @var Video $video */
        $video = $this->model()::create($validatedData);
        $video->refresh();

        return $video;
    }

    public function update(Request $request, $id)
    {
        $this->addRulesIfGenresHasCategories($request);
        /** @var Video $video */
        $video = $this->findOrFail($id);
        $validatedData = $this->validate($request, $this->rulesUpdate());
        $video->update($validatedData);

        return $video;
    }

    protected function addRulesIfGenresHasCategories(Request $request)
    {
        $categoriesId = $request->input('categories_id', []);
        $categoriesId = is_array($categoriesId) ? $categoriesId : [];
        $this->rules['genres_id'][] = new GenresHasCategoriesRule($categoriesId);
        //$this->rules['genres_id'][] = new GenresHasCategoriesRule($request->input('categories_id') ?? []);
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
