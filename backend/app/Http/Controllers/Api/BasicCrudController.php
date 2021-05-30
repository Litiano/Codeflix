<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection as JsonResourceCollection;
use Illuminate\Http\Response;

abstract class BasicCrudController extends Controller
{
    protected int $defaultPerPage = 15;

    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', $this->defaultPerPage);
        $hasFilter = in_array(Filterable::class, class_uses($this->model()));
        $query = $this->queryBuilder();
        if ($hasFilter) {
            $query = $query->filter($request->all());
        }
        $data = $request->has('all') || !$this->defaultPerPage ? $query->get() : $query->paginate($perPage);

        $resource = $this->resourceCollection();

        return is_subclass_of($resource, JsonResourceCollection::class)
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

    public function show($id)
    {
        $obj = $this->findOrFail($id);
        $resource = $this->resource();

        return new $resource($obj);
    }

    public function update(Request $request, $id)
    {
        $model = $this->findOrFail($id);
        $validatedData = $this->validate(
            $request,
            $request->isMethod('PATCH') ? $this->rulesPatch() : $this->rulesUpdate()
        );
        $model->update($validatedData);
        $resource = $this->resource();

        return new $resource($model);
    }

    public function destroy($id): Response
    {
        $model = $this->findOrFail($id);
        $model->delete();

        return response()->noContent();
    }

    public function destroyCollection(Request $request): Response
    {
        $data = $this->validateIds($request);
        $this->model()::whereIn('id', $data['ids'])->delete();

        return response()->noContent();
    }

    protected function validateIds(Request $request): array
    {
        $ids = explode(',', $request->input('ids'));
        $validator = \Validator::make(
            ['ids' => $ids],
            ['ids' => 'required|exists:'.$this->model().',id']
        );

        return $validator->validate();
    }

    abstract protected function model(): string | Model;

    abstract protected function rulesStore(): array;

    abstract protected function rulesUpdate(): array;

    protected function rulesPatch(): array
    {
        return array_map(function ($rules) {
            if (is_array($rules) && in_array('required', $rules)) {
                array_unshift($rules, 'sometimes');
            } elseif (is_string($rules)) {
                $rules = explode('|', $rules);
                if (in_array('required', $rules)) {
                    array_unshift($rules, 'sometimes');
                }
                $rules = implode('|', $rules);
            }

            return $rules;
        }, $this->rulesUpdate());
    }

    abstract protected function resourceCollection(): string | JsonResource;

    abstract protected function resource(): string | JsonResource;

    protected function findOrFail($id): Model
    {
        $model = $this->model();
        $keyName = (new $model())->getRouteKeyName();

        return $this->queryBuilder()->where($keyName, $id)->firstOrFail();
    }

    protected function queryBuilder(): Builder
    {
        return $this->model()::query();
    }
}
