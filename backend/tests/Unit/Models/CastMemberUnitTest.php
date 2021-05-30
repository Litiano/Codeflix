<?php

namespace Tests\Unit\Models;

use App\Models\CastMember;
use App\Models\UuidModel;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Tests\TestCase;

class CastMemberUnitTest extends TestCase
{
    private CastMember $castMember;

    protected function setUp(): void
    {
        parent::setUp();
        $this->castMember = new CastMember();
    }

    public function testUuid()
    {
        $this->assertTrue($this->castMember instanceof UuidModel);
        $this->assertFalse($this->castMember->incrementing);
        $this->assertEquals('string', $this->castMember->getKeyType());
    }

    public function testFillableAttributes()
    {
        $this->assertEquals(['name', 'type'], $this->castMember->getFillable());
    }

    public function testDates()
    {
        $dates = ['created_at', 'updated_at'];
        $this->assertEqualsCanonicalizing($dates, $this->castMember->getDates());
        $this->assertCount(count($dates), $this->castMember->getDates());
    }

    public function testIfUseTraits()
    {
        $traits = [
            SoftDeletes::class,
            Filterable::class,
            HasFactory::class,
        ];
        $this->assertEquals($traits, array_keys(class_uses(CastMember::class)));
    }

    public function testCasts()
    {
        $casts = ['deleted_at' => 'datetime'];
        foreach ($casts as $key => $type) {
            $this->assertTrue($this->castMember->hasCast($key, $type));
        }
    }
}
