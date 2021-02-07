<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\VideoResource;
use App\Models\Video;
use App\Rules\GenresHasCategoriesRule;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
            'cast_members_id' => ['required', 'array', 'exists:App\Models\CastMember,id,deleted_at,NULL'],
            'thumb_file' => ['image', 'max:' . Video::THUMB_FILE_MAX_SIZE],
            'banner_file' => ['image', 'max:' . Video::BANNER_FILE_MAX_SIZE],
            'trailer_file' => ['mimetypes:video/mp4', 'max:' . Video::TRAILER_FILE_MAX_SIZE],
            'video_file' => ['mimetypes:video/mp4', 'max:' . Video::VIDEO_FILE_MAX_SIZE],
        ];
    }

    public function store(Request $request)
    {
        $this->addRulesIfGenresHasCategories($request);
        $validatedData = $this->validate($request, $this->rulesStore());
        /** @var Video $video */
        $video = $this->model()::create($validatedData);
        $video->refresh();
        $resource = $this->resource();

        return new $resource($video);
    }

    public function update(Request $request, $id)
    {
        $this->addRulesIfGenresHasCategories($request);
        /** @var Video $video */
        $video = $this->findOrFail($id);
        $validatedData = $this->validate($request, $this->rulesUpdate());
        $video->update($validatedData);
        $resource = $this->resource();

        return new $resource($video);
    }

    protected function addRulesIfGenresHasCategories(Request $request)
    {
        $categoriesId = $request->input('categories_id', []);
        $categoriesId = is_array($categoriesId) ? $categoriesId : [];
        $this->rules['genres_id'][] = new GenresHasCategoriesRule($categoriesId);
    }

    protected function model(): string|Model
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

    protected function resourceCollection(): string|JsonResource
    {
        return $this->resource();
    }

    protected function resource(): string|JsonResource
    {
        return VideoResource::class;
    }
}
