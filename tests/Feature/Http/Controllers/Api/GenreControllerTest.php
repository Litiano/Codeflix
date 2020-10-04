<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\Api\GenreController;
use App\Models\Category;
use App\Models\Genre;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\TestResponse;
use Illuminate\Http\Request;
use Mockery;
use Tests\Exceptions\TestException;
use Tests\TestCase;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class GenreControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves;

    private Genre $genre;

    public function testIndex()
    {
        $response = $this->getJson(route('api.genres.index'));

        $response->assertStatus(200)
            ->assertJson([$this->genre->toArray()]);
    }

    public function testShow()
    {
        $response = $this->getJson(route('api.genres.show', $this->genre));

        $response->assertStatus(200)
            ->assertJson($this->genre->toArray());
    }

    public function testInvalidationData()
    {
        $data = ['name' => '', 'categories_id' => ''];
        $this->assertInvalidationStoreAction($data, 'required');
        $this->assertInvalidationUpdateAction($data, 'required');

        $data = ['name' => str_repeat('Olá mundo novo', 30)];
        $this->assertInvalidationStoreAction($data, 'max.string', ['max' => 255]);
        $this->assertInvalidationupdateAction($data, 'max.string', ['max' => 255]);

        $data = ['is_active' => 'a'];
        $this->assertInvalidationStoreAction($data, 'boolean');
        $this->assertInvalidationupdateAction($data, 'boolean');

        $data = ['categories_id' => 'a'];
        $this->assertInvalidationStoreAction($data, 'array');
        $this->assertInvalidationupdateAction($data, 'array');

        $data = ['categories_id' => [100]];
        $this->assertInvalidationStoreAction($data, 'exists');
        $this->assertInvalidationupdateAction($data, 'exists');

        /** @var Category $category */
        $category = factory(Category::class)->create();
        $category->delete();
        $data = ['categories_id' => [$category->id]];
        $this->assertInvalidationStoreAction($data, 'exists');
        $this->assertInvalidationupdateAction($data, 'exists');
    }

    public function testStore()
    {
        $categoryId = factory(Category::class)->create()->id;
        $data = ['name' => 'test'];
        $response = $this->assertStore(
            $data + ['categories_id' => [$categoryId]],
            ['is_active' => true, 'deleted_at' => null]
        );
        $response->assertJsonStructure(['created_at', 'updated_at']);

        $this->assertHasCategory($response->json('id'), $categoryId);

        $data = [
            'name' => 'test',
            'is_active' => false,
        ];
        $this->assertStore(
            $data + ['categories_id' => [$categoryId]],
            $data + ['deleted_at' => null]
        );
    }

    public function testUpdate()
    {
        $categoryId = factory(Category::class)->create()->id;
        $this->genre = factory(Genre::class)->create([
            'is_active' => false,
        ]);
        $data = ['is_active' => true, 'name' => 'test'];
        $response = $this->assertUpdate(
            $data + ['categories_id' => [$categoryId]],
            $data + ['deleted_at' => null]
        );
        $response->assertJsonStructure(['created_at', 'updated_at']);

        $this->assertHasCategory($response->json('id'), $categoryId);
    }

    public function testSyncCategories()
    {
        $categoriesId = factory(Category::class, 3)->create()->pluck('id')->toArray();

        $sendData = [
            'name' => 'test',
            'categories_id' => [$categoriesId[0]]
        ];
        $response = $this->postJson($this->routeStore(), $sendData);
        $this->assertDatabaseHas('category_genre', [
            'category_id' => $categoriesId[0],
            'genre_id' => $response->json('id'),
        ]);

        $sendData = [
            'name' => 'test',
            'categories_id' => [$categoriesId[1], $categoriesId[2]]
        ];
        $response = $this->putJson(
            route('api.genres.update', $response->json('id')),
            $sendData
        );
        $this->assertDatabaseMissing('category_genre', [
            'category_id' => $categoriesId[0],
            'genre_id' => $response->json('id'),
        ]);

        $this->assertDatabaseHas('category_genre', [
            'category_id' => $categoriesId[1],
            'genre_id' => $response->json('id'),
        ]);
        $this->assertDatabaseHas('category_genre', [
            'category_id' => $categoriesId[2],
            'genre_id' => $response->json('id'),
        ]);
    }

    public function testDestroy()
    {
        $response = $this->deleteJson(route('api.genres.destroy', $this->genre));
        $response->assertStatus(204);
        $this->assertNull(Genre::find($this->genre->id));
        $this->assertNotNull(Genre::withTrashed()->find($this->genre->id));
    }

    public function testRollbackStore()
    {
        $controller = Mockery::mock(GenreController::class)
            ->makePartial()
            ->shouldAllowMockingProtectedMethods();

        $controller->shouldReceive('validate')
            ->withAnyArgs()
            ->andReturn(['name' => 'test']);

        $controller->shouldReceive('rulesStore')
            ->withAnyArgs()
            ->andReturn([]);

        $controller->shouldReceive('handleRelations')
            ->once()
            ->andThrow(new TestException('pare ai'));

        $request = Mockery::mock(Request::class);

        $hasError = false;
        try {
            $controller->store($request);
        } catch (TestException $e) {
            $hasError = true;
            $this->assertCount(1, Genre::all());
        }

        $this->assertTrue($hasError);
    }

    public function testRollbackUpdate()
    {
        $controller = Mockery::mock(GenreController::class)
            ->makePartial()
            ->shouldAllowMockingProtectedMethods();

        $controller->shouldReceive('findOrFail')
            ->withAnyArgs()
            ->andReturn($this->genre);

        $controller->shouldReceive('validate')
            ->withAnyArgs()
            ->andReturn(['name' => 'test']);

        $controller->shouldReceive('rulesUpdate')
            ->withAnyArgs()
            ->andReturn([]);

        $controller->shouldReceive('handleRelations')
            ->once()
            ->andThrow(new TestException('pare ai'));

        $request = Mockery::mock(Request::class);

        $hasError = false;
        try {
            $controller->update($request, 1);
        } catch (TestException $e) {
            $hasError = true;
            $this->assertCount(1, Genre::all());
        }

        $this->assertTrue($hasError);
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->genre = factory(Genre::class)->create();
    }

    protected function routeStore()
    {
        return route('api.genres.store');
    }

    protected function routeUpdate()
    {
        return route('api.genres.update', $this->genre);
    }

    protected function model()
    {
        return Genre::class;
    }

    protected function assertHasCategory($genreId, $categoryId)
    {
        $this->assertDatabaseHas('category_genre', [
            'genre_id' => $genreId,
            'category_id' => $categoryId,
        ]);
    }
}
