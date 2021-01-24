<?php

namespace Tests\Feature\Models;

use App\Models\Genre;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class GenreTest extends TestCase
{
    use DatabaseMigrations;

    public function testList()
    {
        factory(Genre::class, 1)->create();
        $genres = Genre::all();
        $this->assertCount(1, $genres);

        $genresKeys = array_keys($genres->first()->getAttributes());
        $this->assertEqualsCanonicalizing([
            'id', 'name', 'is_active', 'created_at', 'updated_at', 'deleted_at',
        ], $genresKeys);
    }

    public function testCreate()
    {
        $genre = Genre::create(['name' => 'Genre 1'])->refresh();
        $this->assertEquals(36, strlen($genre->id));
        $this->assertMatchesRegularExpression('/[[:xdigit:]]{8}-[[:xdigit:]]{4}-[[:xdigit:]]{4}-[[:xdigit:]]{4}-[[:xdigit:]]{12}/', $genre->id);
        $this->assertEquals('Genre 1', $genre->name);
        $this->assertTrue($genre->is_active);

        $genre = Genre::create(['name' => 'Genre 1', 'is_active' => false])->refresh();
        $this->assertFalse($genre->is_active);

        $genre = Genre::create(['name' => 'Genre 1', 'is_active' => true])->refresh();
        $this->assertTrue($genre->is_active);
    }


    public function testUpdate()
    {
        $category = factory(Genre::class)->create([
            'is_active' => false
        ]);

        $data = [
            'name' => 'test name update',
            'is_active' => true,
        ];
        $category->update($data);

        $this->assertEqualsCanonicalizing($data, $category->only(array_keys($data)));
        $category->refresh();
        $this->assertEqualsCanonicalizing($data, $category->only(array_keys($data)));
    }


    public function testDelete()
    {
        /** @var Genre $category */
        $category = factory(Genre::class)->create();
        $category->delete();
        $this->assertNull(Genre::find($category->id));
        $this->assertNull(Genre::first());

        $category->restore();
        $this->assertNotNull(Genre::find($category->id));
        $this->assertNotNull(Genre::first());
    }
}
