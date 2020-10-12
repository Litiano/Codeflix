<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;
use Tests\Traits\TestResources;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class CategoryControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves, TestResources;

    private Category $category;
    private array $serializedFields = [
        'id',
        'name',
        'description',
        'is_active',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function testIndex()
    {
        $response = $this->getJson(route('api.categories.index'));

        $response->assertStatus(200)
            ->assertJson([
                'meta' => ['per_page' => 15]
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => $this->serializedFields
                ],
                'meta' => [],
                'links' => [],
            ])
            ->assertJson(['data' => [$this->category->toArray()]]);

        $resource = CategoryResource::collection([$this->category]);
        $this->assertResource($response, $resource);
    }

    public function testShow()
    {
        $response = $this->getJson(route('api.categories.show', $this->category));

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => $this->serializedFields])
            ->assertJson(['data' => $this->category->toArray()]);

        $id = $this->getIdFromResponse($response);
        $resource = new CategoryResource(Category::find($id));
        $this->assertResource($response, $resource);
    }

    public function testInvalidationData()
    {
        $data = ['name' => ''];
        $this->assertInvalidationStoreAction($data, 'required');
        $this->assertInvalidationUpdateAction($data, 'required');

        $data = ['name' => str_repeat('Olá mundo novo', 30)];
        $this->assertInvalidationStoreAction($data, 'max.string', ['max' => 255]);
        $this->assertInvalidationupdateAction($data, 'max.string', ['max' => 255]);

        $data = ['is_active' => 'a'];
        $this->assertInvalidationStoreAction($data, 'boolean');
        $this->assertInvalidationupdateAction($data, 'boolean');
    }

    public function testStore()
    {
        $data = ['name' => 'test'];
        $response = $this->assertStore($data, $data + ['description' => null, 'is_active' => true, 'deleted_at' => null]);
        $response->assertJsonStructure(['data' => $this->serializedFields]);

        $data = [
            'name' => 'test',
            'description' => 'Descrição',
            'is_active' => false,
        ];
        $this->assertStore($data, $data + ['deleted_at' => null]);
        $id = $this->getIdFromResponse($response);
        $resource = new CategoryResource(Category::find($id));
        $this->assertResource($response, $resource);
    }

    public function testUpdate()
    {
        $this->category = factory(Category::class)->create([
            'is_active' => false, 'description' => 'description'
        ]);
        $data = [
            'name' => 'test',
            'description' => 'test',
            'is_active' => true,
        ];
        $response = $this->assertUpdate($data, $data + ['deleted_at' => null]);
        $response->assertJsonStructure(['data' => $this->serializedFields]);
        $id = $this->getIdFromResponse($response);
        $resource = new CategoryResource(Category::find($id));
        $this->assertResource($response, $resource);

        $data = ['name' => 'test', 'description' => ' '];
        $this->assertUpdate($data, array_merge($data, ['description' => null]));

        $data['description'] = 'test';
        $this->assertUpdate($data, $data);

        $data['description'] = null;
        $this->assertUpdate($data, $data);
    }

    public function testDestroy()
    {
        $response = $this->deleteJson(route('api.categories.destroy', $this->category));
        $response->assertStatus(204);
        $this->assertNull(Category::find($this->category->id));
        $this->assertNotNull(Category::withTrashed()->find($this->category->id));
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->category = factory(Category::class)->create();
    }

    protected function routeStore()
    {
        return route('api.categories.store');
    }

    protected function routeUpdate()
    {
        return route('api.categories.update', $this->category);
    }

    protected function model()
    {
        return Category::class;
    }
}
