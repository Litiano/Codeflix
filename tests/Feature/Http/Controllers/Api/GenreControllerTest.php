<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Models\Genre;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\TestResponse;
use Tests\TestCase;
use Tests\Traits\TestValidations;

class GenreControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations;

    private Genre $genre;

    public function testIndex()
    {
        /** @var Genre $genre */
        $genre = factory(Genre::class)->create();
        $response = $this->getJson(route('api.genres.index'));

        $response->assertStatus(200)
            ->assertJson([$genre->toArray()]);
    }

    public function testShow()
    {
        /** @var Genre $genre */
        $genre = factory(Genre::class)->create();
        $response = $this->getJson(route('api.genres.show', $genre));

        $response->assertStatus(200)
            ->assertJson($genre->toArray());
    }

    public function testInvalidationData()
    {
        /*################################## CREATE #####################################*/
        $response = $this->postJson(route('api.genres.store'));
        $this->assertInvalidationRequired($response);

        $response = $this->postJson(route('api.genres.store'), [
            'name' => str_repeat('Olá mundo novo', 30),
            'is_active' => 'a'
        ]);
        $this->assertInvalidationMax($response);
        $this->assertInvalidationBoolean($response);

        /*################################## UPDATE #####################################*/

        /** @var Genre $genre */
        $genre = factory(Genre::class)->create();
        $response = $this->putJson(route('api.genres.update', $genre));
        $this->assertInvalidationRequired($response);

        /** @var Genre $genre */
        $genre = factory(Genre::class)->create();
        $response = $this->putJson(route('api.genres.update', $genre), [
            'name' => str_repeat('Olá mundo novo', 30),
            'is_active' => 'a'
        ]);
        $this->assertInvalidationMax($response);
        $this->assertInvalidationBoolean($response);
    }

    private function assertInvalidationRequired(TestResponse $response)
    {
        $response->assertJsonMissingValidationErrors(['is_active']);
        $this->assertInvalidationFields($response, ['name'], 'required');
    }

    public function assertInvalidationMax(TestResponse $response)
    {
        $this->assertInvalidationFields($response, ['name'], 'max.string', ['max' => 255]);
    }

    public function assertInvalidationBoolean(TestResponse $response)
    {
        $this->assertInvalidationFields($response, ['is_active'], 'boolean');
    }

    public function testStore()
    {
        $response = $this->postJson(route('api.genres.store'), [
            'name' => 'test'
        ]);
        $genre = Genre::find($response->json('id'));
        $response->assertStatus(201)
            ->assertJson($genre->toArray());
        $this->assertTrue($response->json('is_active'));
        $this->assertEquals('test', $response->json('name'));

        /**/
        $response = $this->postJson(route('api.genres.store'), [
            'name' => 'test',
            'is_active' => false,
        ]);
        $response->assertJsonFragment([
            'is_active' => false,
        ]);
    }

    public function testUpdate()
    {
        /** @var Genre $genre */
        $genre = factory(Genre::class)->create([
            'is_active' => false,
        ]);
        $response = $this->putJson(route('api.genres.update', $genre), [
            'name' => 'test',
            'is_active' => true,
        ]);
        $genre = Genre::find($response->json('id'));
        $response->assertStatus(200)
            ->assertJson($genre->toArray())
            ->assertJsonFragment([
                'is_active' => true
            ]);
    }

    public function testDestroy()
    {
        /** @var Genre $genre */
        $genre = factory(Genre::class)->create();
        $response = $this->deleteJson(route('api.genres.destroy', $genre));
        $response->assertStatus(204);
        $this->assertNull(Genre::find($genre->id));
        $this->assertNotNull(Genre::withTrashed()->find($genre->id));
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
}
