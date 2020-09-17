<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\Api\BasicCrudController;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Mockery;
use ReflectionClass;
use Tests\Stubs\Controllers\CategoryControllerStub;
use Tests\Stubs\Models\CategoryStub;
use Tests\TestCase;

class BasicCrudControllerTest extends TestCase
{
    protected Controller $controller;

    public function testIndex()
    {
        /** @var CategoryStub $category */
        $category = CategoryStub::create(['name' => 'teste name', 'description' => 'test descrição']);
        $result = $this->controller->index()->toArray();
        $this->assertEquals([$category->toArray()], $result);
    }

    public function testInvalidationDataStore()
    {
        // Mockery php
        //$request = $this->mock(Request::class);
        $request = Mockery::mock(Request::class);
        $request->shouldReceive('all')
            ->once()
            ->andReturn(['name' => '']);

        $this->expectException(ValidationException::class);
        $this->controller->store($request);
    }

    public function testStore()
    {
        // Mockery php
        //$request = $this->mock(Request::class);
        $request = Mockery::mock(Request::class);
        $request->shouldReceive('all')
            ->once()
            ->andReturn(['name' => 'test name', 'description' => 'test description']);

        $model = $this->controller->store($request);
        $this->assertEquals(CategoryStub::first()->toArray(), $model->toArray());
    }

    public function testIfFindOrFailFetchModel()
    {
        $category = CategoryStub::create(['name' => 'teste name', 'description' => 'test descrição']);

        $reflectionClass = new ReflectionClass(BasicCrudController::class);
        $reflectionMethod = $reflectionClass->getMethod('findOrFail');
        $reflectionMethod->setAccessible(true);

        $result = $reflectionMethod->invokeArgs($this->controller, [$category->id]);
        $this->assertInstanceOf(CategoryStub::class, $result);
    }

    public function testIfFindOrFailThrowExceptionWhenIdInvalid()
    {
        $reflectionClass = new ReflectionClass(BasicCrudController::class);
        $reflectionMethod = $reflectionClass->getMethod('findOrFail');
        $reflectionMethod->setAccessible(true);

        $this->expectException(ModelNotFoundException::class);
        $reflectionMethod->invokeArgs($this->controller, [0]);
    }

    public function testShow()
    {
        $category = CategoryStub::create(['name' => 'teste name', 'description' => 'test descrição'])->refresh();
        $result = $this->controller->show($category->id);
        $this->assertEquals($result->toArray(), $category->toArray());
    }

    public function testUpdate()
    {
        $category = CategoryStub::create(['name' => 'teste name', 'description' => 'test descrição']);
        $request = Mockery::mock(Request::class);
        $request->shouldReceive('all')
            ->once()
            ->andReturn(['name' => 'test name change', 'description' => 'test description changed']);

        $result = $this->controller->update($request, $category->id);

        $this->assertEquals($result->toArray(), $category->refresh()->toArray());
    }

    public function testDestroy()
    {
        $category = CategoryStub::create(['name' => 'teste name', 'description' => 'test descrição']);
        $this->assertCount(1, CategoryStub::all());

        $response = $this->controller->destroy($category->id);

        $this->createTestResponse($response)
            ->assertStatus(204);

        $this->assertCount(0, CategoryStub::all());
    }

    protected function setUp(): void
    {
        parent::setUp();
        CategoryStub::dropTable();
        CategoryStub::createTable();
        $this->controller = new CategoryControllerStub();
    }

    protected function tearDown(): void
    {
        CategoryStub::dropTable();
        parent::tearDown();
    }
}
