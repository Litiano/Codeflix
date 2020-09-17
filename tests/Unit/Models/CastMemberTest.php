<?php

namespace Tests\Unit\Models;

use App\Models\CastMember;
use App\Models\UuidModel;
use Illuminate\Database\Eloquent\SoftDeletes;
use Tests\TestCase;

class CastMemberTest extends TestCase
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
        $dates = ['deleted_at', 'created_at', 'updated_at'];
        $this->assertEqualsCanonicalizing($dates, $this->castMember->getDates());
        $this->assertCount(count($dates), $this->castMember->getDates());
    }

    public function testIfUseTraits()
    {
        $traits = [
            SoftDeletes::class
        ];
        $this->assertEquals($traits, array_keys(class_uses(CastMember::class)));
    }

    public function testCasts()
    {
        $this->assertEqualsCanonicalizing([], $this->castMember->getCasts());
    }
}
