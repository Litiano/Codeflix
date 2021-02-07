<?php

namespace Tests\Stubs\Controllers;

use App\Http\Controllers\Api\BasicCrudController;
use App\Http\Resources\CategoryResource;
use Illuminate\Database\Eloquent\Model;
use Tests\Stubs\Models\CategoryStub;

class CategoryControllerStub extends BasicCrudController
{
    /**
     * @return Model
     */
    protected function model(): string|Model
    {
        return CategoryStub::class;
    }

    protected function rulesStore(): array
    {
        return [
            'name' => 'required|max:255',
            'description' => 'nullable',
        ];
    }

    protected function rulesUpdate(): array
    {
        return $this->rulesStore();
    }

    protected function resourceCollection(): string
    {
        return $this->resource();
    }

    protected function resource(): string
    {
        return CategoryResource::class;
    }
}
