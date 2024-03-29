<?php

namespace Tests\Unit\Models;

use App\Models\Category;
use App\Models\UuidModel;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Tests\TestCase;

class CategoryUnitTest extends TestCase
{
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->category = new Category();
    }

    public function testUuid()
    {
        $this->assertTrue($this->category instanceof UuidModel);
        $this->assertFalse($this->category->incrementing);
        $this->assertEquals('string', $this->category->getKeyType());
    }

    public function testFillableAttributes()
    {
        $this->assertEquals(['name', 'description', 'is_active'], $this->category->getFillable());
    }

    public function testDates()
    {
        $dates = ['created_at', 'updated_at'];
        $this->assertEqualsCanonicalizing($dates, $this->category->getDates());
        $this->assertCount(count($dates), $this->category->getDates());
    }

    public function testIfUseTraits()
    {
        $traits = [
            SoftDeletes::class,
            Filterable::class,
            HasFactory::class,
        ];
        $this->assertEqualsCanonicalizing($traits, array_keys(class_uses(Category::class)));
    }

    public function testCasts()
    {
        $casts = [
            'is_active' => 'bool',
            'deleted_at' => 'datetime',
        ];
        foreach ($casts as $key => $type) {
            $this->assertTrue($this->category->hasCast($key, $type));
        }
    }
}
