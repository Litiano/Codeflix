<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Resources\CastMemberResource;
use App\Models\CastMember;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;
use Tests\Traits\TestResources;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class CastMemberControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves, TestResources;

    private CastMember $castMember;

    private array $fieldsSerialized = [
        'id',
        'name',
        'type',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function testIndex()
    {
        $response = $this->getJson(route('api.cast_members.index'));

        $response->assertStatus(200)
            ->assertJson(['data' => [$this->castMember->toArray()]])
            ->assertJsonStructure([
                'data' => [
                    '*' => $this->fieldsSerialized
                ],
                'meta' => [],
                'links' => [],
            ]);
        $this->assertResource($response, CastMemberResource::collection([$this->castMember]));
    }

    public function testShow()
    {
        $response = $this->getJson(route('api.cast_members.show', $this->castMember));

        $response->assertStatus(200)
            ->assertJson(['data' => $this->castMember->toArray()])
            ->assertJsonStructure([
                'data' => $this->fieldsSerialized
            ]);

        $id = $this->getIdFromResponse($response);
        $castMember = CastMember::find($id);
        $this->assertResource($response, new CastMemberResource($castMember));
    }

    public function testInvalidationData()
    {
        $data = ['name' => ''];
        $this->assertInvalidationStoreAction($data, 'required');
        $this->assertInvalidationUpdateAction($data, 'required');

        $data = ['name' => str_repeat('Olá mundo novo', 30)];
        $this->assertInvalidationStoreAction($data, 'max.string', ['max' => 255]);
        $this->assertInvalidationupdateAction($data, 'max.string', ['max' => 255]);

        $data = ['type' => 'a'];
        $this->assertInvalidationStoreAction($data, 'in');
        $this->assertInvalidationupdateAction($data, 'in');
    }

    public function testStore()
    {
        $data = [
            ['name' => 'test director', 'type' => CastMember::TYPE_DIRECTOR],
            ['name' => 'test actor', 'type' => CastMember::TYPE_ACTOR]
        ];

        foreach ($data as $item) {
            $response = $this->assertStore($item, $item + ['deleted_at' => null]);
            $response->assertJsonStructure(['data' => $this->fieldsSerialized]);
            $this->assertResource(
                $response,
                new CastMemberResource(CastMember::find($this->getIdFromResponse($response)))
            );
        }
    }

    public function testUpdate()
    {
        $this->castMember = CastMember::factory()->create([
            'type' => CastMember::TYPE_DIRECTOR,
        ]);
        $data = ['type' => CastMember::TYPE_ACTOR, 'name' => 'test'];
        $response = $this->assertUpdate($data, $data + ['deleted_at' => null]);
        $response->assertJsonStructure(['data' => $this->fieldsSerialized]);
        $this->assertResource(
            $response,
            new CastMemberResource(CastMember::find($this->getIdFromResponse($response)))
        );

        $data = ['name' => 'test 2', 'type' => CastMember::TYPE_DIRECTOR,];
        $response = $this->assertUpdate($data, $data);
        $response->assertJsonStructure(['data' => $this->fieldsSerialized]);
        $this->assertResource(
            $response,
            new CastMemberResource(CastMember::find($this->getIdFromResponse($response)))
        );
    }

    public function testDestroy()
    {
        $response = $this->deleteJson(route('api.cast_members.destroy', $this->castMember));
        $response->assertStatus(204);
        $this->assertNull(CastMember::find($this->castMember->id));
        $this->assertNotNull(CastMember::withTrashed()->find($this->castMember->id));
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->castMember = CastMember::factory()->create(['type' => CastMember::TYPE_DIRECTOR]);
    }

    protected function routeStore(): string
    {
        return route('api.cast_members.store');
    }

    protected function routeUpdate(): string
    {
        return route('api.cast_members.update', $this->castMember);
    }

    protected function model(): string
    {
        return CastMember::class;
    }
}
