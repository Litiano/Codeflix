<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ModelFilters\CategoryFilter;
use App\Models\Category;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

abstract class BasicCrudController extends Controller
{
    abstract protected function model(): string|Model;
    abstract protected function rulesStore(): array;
    abstract protected function rulesUpdate(): array;
    protected abstract function resourceCollection(): string|JsonResource;
    protected abstract function resource(): string|JsonResource;
    protected int $defaultPerPage = 15;

    public function index(Request $request)
    {
        $perPage = (int)$request->input('per_page', $this->defaultPerPage);
        $hasFilter = in_array(Filterable::class, class_uses($this->model()));
        $query = $this->queryBuilder();
        if ($hasFilter) {
            $query = $query->filter($request->all());
        }
        $data = $request->has('all') || !$this->defaultPerPage ? $query->get() : $query->paginate($perPage);

        $resource = $this->resourceCollection();

        $refClass = new \ReflectionClass($resource);

        return $refClass->isSubclassOf(ResourceCollection::class)
            ? new $resource($data) : $resource::collection($data);
    }

    public function store(Request $request)
    {
        $validatedData = $this->validate($request, $this->rulesStore());
        /** @var Model $model */
        $model = $this->queryBuilder()->create($validatedData);
        $model->refresh();
        $resource = $this->resource();

        return new $resource($model);
    }

    protected function findOrFail($id): Model
    {
        $model = $this->model();
        $keyName = (new $model)->getRouteKeyName();

        return $this->queryBuilder()->where($keyName, $id)->firstOrFail();
    }

    public function show($id)
    {
        $obj = $this->findOrFail($id);
        $resource = $this->resource();

        return new $resource($obj);
    }

    public function update(Request $request, $id)
    {
        $model = $this->findOrFail($id);
        $validatedData = $this->validate($request, $this->rulesUpdate());
        $model->update($validatedData);
        $resource = $this->resource();

        return new $resource($model);
    }

    public function destroy($id)
    {
        $model = $this->findOrFail($id);
        $model->delete();

        return response()->noContent();
    }

    protected function queryBuilder(): Builder
    {
        return $this->model()::query();
    }
}
