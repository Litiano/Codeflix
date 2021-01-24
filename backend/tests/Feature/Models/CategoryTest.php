<?php

namespace Tests\Feature\Models;

use App\Models\Category;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use DatabaseMigrations;

    public function testList()
    {
        factory(Category::class, 1)->create();
        $categories = Category::all();
        $this->assertCount(1, $categories);

        $categoryKeys = array_keys($categories->first()->getAttributes());
        $this->assertEqualsCanonicalizing([
            'id', 'name', 'description', 'is_active', 'created_at', 'updated_at', 'deleted_at',
        ], $categoryKeys);
    }

    public function testCreate()
    {
        $category = Category::create(['name' => 'Categoria 1'])->refresh();
        $this->assertEquals(36, strlen($category->id));
        $this->assertMatchesRegularExpression('/[[:xdigit:]]{8}-[[:xdigit:]]{4}-[[:xdigit:]]{4}-[[:xdigit:]]{4}-[[:xdigit:]]{12}/', $category->id);
        $this->assertEquals('Categoria 1', $category->name);
        $this->assertNull($category->description);
        $this->assertTrue($category->is_active);

        $category = Category::create(['name' => 'Categoria 1', 'description' => null])->refresh();
        $this->assertNull($category->description);

        $category = Category::create(['name' => 'Categoria 1', 'description' => 'Desc'])->refresh();
        $this->assertEquals('Desc', $category->description);

        $category = Category::create(['name' => 'Categoria 1', 'is_active' => false])->refresh();
        $this->assertFalse($category->is_active);

        $category = Category::create(['name' => 'Categoria 1', 'is_active' => true])->refresh();
        $this->assertTrue($category->is_active);
    }

    public function testUpdate()
    {
        $category = factory(Category::class)->create([
            'is_active' => false
        ]);

        $data = [
            'name' => 'test name update',
            'is_active' => true,
            'description' => 'test description update'
        ];
        $category->update($data);

        $this->assertEqualsCanonicalizing($data, $category->only(array_keys($data)));
        $category->refresh();
        $this->assertEqualsCanonicalizing($data, $category->only(array_keys($data)));
    }

    public function testDelete()
    {
        /** @var Category $category */
        $category = factory(Category::class)->create();
        $category->delete();
        $this->assertNull(Category::find($category->id));
        $this->assertNull(Category::first());

        $category->restore();
        $this->assertNotNull(Category::find($category->id));
        $this->assertNotNull(Category::first());
    }
}
