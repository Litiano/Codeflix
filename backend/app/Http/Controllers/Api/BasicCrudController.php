<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

abstract class BasicCrudController extends Controller
{
    /**
     * @return Model
     */
    abstract protected function model():string;
    abstract protected function rulesStore():array;
    abstract protected function rulesUpdate():array;
    protected abstract function resourceCollection():string;
    protected abstract function resource():string;
    protected int $paginationSize = 15;

    public function index()
    {
        $resource = $this->resourceCollection();
        $data = !$this->paginationSize ? $this->model()::all() : $this->model()::paginate($this->paginationSize);

        $refClass = new \ReflectionClass($resource);

        return $refClass->isSubclassOf(ResourceCollection::class)
            ? new $resource($data) : $resource::collection($data);
    }

    public function store(Request $request)
    {
        $validatedData = $this->validate($request, $this->rulesStore());
        /** @var Model $model */
        $model = $this->model()::create($validatedData);
        $model->refresh();
        $resource = $this->resource();

        return new $resource($model);
    }

    /**
     * @param $id
     * @return Model
     */
    protected function findOrFail($id)
    {
        $model = $this->model();
        $keyName = (new $model)->getRouteKeyName();

        return $this->model()::where($keyName, $id)->firstOrFail();
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
}
