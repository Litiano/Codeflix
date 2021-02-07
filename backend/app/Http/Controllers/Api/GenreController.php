<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\GenreResource;
use App\Models\Genre;
use DB;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GenreController extends BasicCrudController
{
    protected int $defaultPerPage = 3;

    private array $rules = [
        'name' => 'required|max:255',
        'is_active' => 'boolean',
        'categories_id' => 'required|array|exists:App\Models\Category,id,deleted_at,NULL',
    ];

    public function store(Request $request)
    {
        $genre = DB::transaction(function () use ($request) {
            $validatedData = $this->validate($request, $this->rulesStore());
            /** @var Genre $genre */
            $genre = $this->model()::create($validatedData);
            $this->handleRelations($genre, $request);
            $genre->refresh();

            return $genre;
        });
        $resource = $this->resource();

        return new $resource($genre);
    }

    public function update(Request $request, $id)
    {
        /** @var Genre $genre */
        $genre = $this->findOrFail($id);
        $genre = DB::transaction(function () use ($request, $genre) {
            $validatedData = $this->validate($request, $this->rulesUpdate());
            $genre->update($validatedData);
            $this->handleRelations($genre, $request);

            return $genre;
        });
        $resource = $this->resource();

        return new $resource($genre);
    }

    protected function handleRelations(Genre $genre, Request $request)
    {
        $genre->categories()->sync($request->input('categories_id'));
    }

    protected function model(): string|Model
    {
        return Genre::class;
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
        return GenreResource::class;
    }
}
