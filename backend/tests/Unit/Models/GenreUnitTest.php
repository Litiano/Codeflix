<?php

namespace Tests\Unit\Models;

use App\Models\Genre;
use App\Models\UuidModel;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
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
        $dates = ['created_at', 'updated_at'];
        $this->assertEqualsCanonicalizing($dates, $this->genre->getDates());
        $this->assertCount(count($dates), $this->genre->getDates());
    }

    public function testIfUseTraits()
    {
        $traits = [
            SoftDeletes::class,
            Filterable::class,
            HasFactory::class,
        ];
        $this->assertEquals($traits, array_keys(class_uses(Genre::class)));
    }

    public function testCasts()
    {
        $casts = ['is_active' => 'bool', 'deleted_at' => 'datetime'];
        foreach ($casts as $key => $type) {
            $this->assertTrue($this->genre->hasCast($key, $type));
        }
    }
}
