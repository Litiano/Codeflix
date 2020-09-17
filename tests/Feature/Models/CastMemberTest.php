<?php

namespace Tests\Feature\Models;

use App\Models\CastMember;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class CastMemberTest extends TestCase
{
    use DatabaseMigrations;

    public function testList()
    {
        factory(CastMember::class, 1)->create();
        $categories = CastMember::all();
        $this->assertCount(1, $categories);

        $castMemberKeys = array_keys($categories->first()->getAttributes());
        $this->assertEqualsCanonicalizing([
            'id', 'name', 'type', 'created_at', 'updated_at', 'deleted_at',
        ], $castMemberKeys);
    }

    public function testCreate()
    {
        $castMember = CastMember::create(['name' => 'Categoria 1', 'type' => CastMember::TYPE_DIRECTOR])->refresh();
        $this->assertEquals(36, strlen($castMember->id));
        $this->assertRegExp('/[[:xdigit:]]{8}-[[:xdigit:]]{4}-[[:xdigit:]]{4}-[[:xdigit:]]{4}-[[:xdigit:]]{12}/', $castMember->id);
        $this->assertEquals('Categoria 1', $castMember->name);
        $this->assertNull($castMember->deleted_at);
    }

    public function testUpdate()
    {
        $castMember = factory(CastMember::class)->create([
            'type' => CastMember::TYPE_ACTOR
        ]);

        $data = [
            'name' => 'test name update',
            'type' => CastMember::TYPE_DIRECTOR

        ];
        $castMember->update($data);

        $this->assertEqualsCanonicalizing($data, $castMember->only(array_keys($data)));
        $castMember->refresh();
        $this->assertEqualsCanonicalizing($data, $castMember->only(array_keys($data)));
    }

    public function testDelete()
    {
        /** @var CastMember $castMember */
        $castMember = factory(CastMember::class)->create();
        $castMember->delete();
        $this->assertNull(CastMember::find($castMember->id));
        $this->assertNull(CastMember::first());

        $castMember->restore();
        $this->assertNotNull(CastMember::find($castMember->id));
        $this->assertNotNull(CastMember::first());
    }
}
