<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Models\Category;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\TestResponse;
use Tests\TestCase;

class CategoryControllerTest extends TestCase
{
    use DatabaseMigrations;

    public function testIndex()
    {
        /** @var Category $category */
        $category = factory(Category::class)->create();
        $response = $this->get(route('api.categories.index'));

        $response->assertStatus(200)
            ->assertJson([$category->toArray()]);
    }

    public function testShow()
    {
        /** @var Category $category */
        $category = factory(Category::class)->create();
        $response = $this->get(route('api.categories.show', $category));

        $response->assertStatus(200)
            ->assertJson($category->toArray());
    }

    public function testInvalidationData()
    {
        /*################################## CREATE #####################################*/
        $response = $this->json('POST', route('api.categories.store'));
        $this->assertInvalidationRequired($response);

        $response = $this->json('POST', route('api.categories.store'), [
            'name' => str_repeat('Olá mundo novo', 30),
            'is_active' => 'a'
        ]);
        $this->assertInvalidationMax($response);
        $this->assertInvalidationBoolean($response);

        /*################################## UPDATE #####################################*/

        /** @var Category $category */
        $category = factory(Category::class)->create();
        $response = $this->json('PUT', route('api.categories.update', $category), []);
        $this->assertInvalidationRequired($response);

        /** @var Category $category */
        $category = factory(Category::class)->create();
        $response = $this->json('PUT', route('api.categories.update', $category), [
            'name' => str_repeat('Olá mundo novo', 30),
            'is_active' => 'a'
        ]);
        $this->assertInvalidationMax($response);
        $this->assertInvalidationBoolean($response);
    }

    private function assertInvalidationRequired(TestResponse $response)
    {
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name'])
            ->assertJsonMissingValidationErrors(['is_active'])
            ->assertJsonFragment([
                trans('validation.required', ['attribute' => trans('validation.attributes.name')])
            ]);
    }

    public function assertInvalidationMax(TestResponse $response)
    {
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name'])
            ->assertJsonFragment([
                trans('validation.max.string', ['attribute' => trans('validation.attributes.name'), 'max' => 255])
            ]);
    }

    public function assertInvalidationBoolean(TestResponse $response)
    {
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['is_active'])
            ->assertJsonFragment([
                trans('validation.boolean', ['attribute' => 'is active'])
            ]);
    }

    public function testStore()
    {
        $response = $this->json('POST', route('api.categories.store'), [
            'name' => 'test'
        ]);
        $category = Category::find($response->json('id'));
        $response->assertStatus(201)
            ->assertJson($category->toArray());
        $this->assertTrue($response->json('is_active'));
        $this->assertNull($response->json('description'));
        $this->assertEquals('test', $response->json('name'));

        /**/
        $response = $this->json('POST', route('api.categories.store'), [
            'name' => 'test',
            'description'=> 'Descrição',
            'is_active' => false,
        ]);
        $response->assertJsonFragment([
            'description' => 'Descrição',
            'is_active' => false,
        ]);
    }

    public function testUpdate()
    {
        /** @var Category $category */
        $category = factory(Category::class)->create([
            'is_active' => false, 'description' => 'desription'
        ]);
        $response = $this->json('PUT', route('api.categories.update', $category), [
            'name' => 'test',
            'description' => 'test',
            'is_active' => true,
        ]);
        $category = Category::find($response->json('id'));
        $response->assertStatus(200)
            ->assertJson($category->toArray())
            ->assertJsonFragment([
                'description' => 'test',
                'is_active' => true
            ]);

        /** @var Category $category */
        $category = factory(Category::class)->create();
        $response = $this->json('PUT', route('api.categories.update', $category), [
            'name' => 'test',
            'description'=> ' ',
        ]);
        $response->assertJsonFragment([
            'description' => null,
        ]);
    }

}
