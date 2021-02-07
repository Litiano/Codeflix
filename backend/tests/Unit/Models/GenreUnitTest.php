<?php

namespace Tests\Unit\Models;

use App\Models\Genre;
use App\Models\Traits\UuidModel;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\SoftDeletes;
use PHPUnit\Framework\TestCase;

class GenreUnitTest extends TestCase
{
    private Genre $genre;

    protected function setUp(): void
    {
        parent::setUp();
        $this->genre = new Genre();
    }

    public function testUuid()
    {
        $this->assertTrue($this->genre instanceof UuidModel);
        $this->assertFalse($this->genre->incrementing);
        $this->assertEquals('string', $this->genre->getKeyType());
    }

    public function testFillableAttributes()
    {
        $this->assertEqualsCanonicalizing(['name', 'is_active'], $this->genre->getFillable());
    }

    public function testDates()
    {
        $dates = ['deleted_at', 'created_at', 'updated_at'];
        $this->assertEqualsCanonicalizing($dates, $this->genre->getDates());
        $this->assertCount(count($dates), $this->genre->getDates());
    }

    public function testIfUseTraits()
    {
        $traits = [
            SoftDeletes::class,
            Filterable::class,
        ];
        $this->assertEquals($traits, array_keys(class_uses(Genre::class)));
    }

    public function testCasts()
    {
        $this->assertEqualsCanonicalizing(['is_active' => 'bool'], $this->genre->getCasts());
    }
}
