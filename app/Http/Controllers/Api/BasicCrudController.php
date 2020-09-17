<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

abstract class BasicCrudController extends Controller
{
    /**
     * @return Model
     */
    abstract protected function model():string;
    abstract protected function rulesStore():array;

    public function index()
    {
        return $this->model()::all();
    }

    public function store(Request $request)
    {
        $validatedData = $this->validate($request, $this->rulesStore());
        /** @var Model $model */
        $model = $this->model()::create($validatedData);
        $model->refresh();

        return $model;
    }

    protected function findOrFail($id)
    {
        $model = $this->model();
        $keyName = (new $model)->getRouteKeyName();
        return $this->model()::where($keyName, $id)->firstOrFail();
    }

    public function show()
    {

    }

//    public function show(Category $category)
//    {
//        return $category;
//    }
//
//    public function update(Request $request, Category $category)
//    {
//        $this->validate($request, $this->rules);
//        $category->update($request->all());
//
//        return $category;
//    }
//
//    public function destroy(Category $category)
//    {
//        $category->delete();
//
//        return response()->noContent();
//    }
}
