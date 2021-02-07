<?php


namespace Tests\Feature\Http\Controllers\Api\VideoController;


use App\Http\Resources\VideoResource;
use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Support\Arr;

class VideoControllerCrudTest extends BaseVideoControllerTestCase
{
    private array $fieldsSerialized = [
        'id',
        'title',
        'description',
        'year_launched',
        'rating',
        'duration',
        'opened',
        'thumb_file_url',
        'banner_file_url',
        'trailer_file_url',
        'video_file_url',
        'created_at',
        'updated_at',
        'deleted_at',
        'categories' => [
            '*' => [
                'id',
                'name',
                'description',
                'is_active',
                'created_at',
                'updated_at',
                'deleted_at',
            ]
        ],
        'genres' => [
            '*' => [
                'id',
                'name',
                'is_active',
                'created_at',
                'updated_at',
                'deleted_at',
            ]
        ],
        'cast_members' => [
            '*' => [
                'id',
                'name',
                'type',
                'created_at',
                'updated_at',
                'deleted_at',
            ]
        ]
    ];

    public function testIndex()
    {
        $response = $this->getJson(route('api.videos.index'));

        $response->assertStatus(200)
            ->assertJson(['data' => [$this->video->toArray()]])
            ->assertJsonStructure([
                'data' => [
                    '*' => $this->fieldsSerialized
                ],
                'meta' => [],
                'links' => [],
            ]);
        $this->assertResource($response, VideoResource::collection([$this->video]));
    }

    public function testShow()
    {
        $response = $this->getJson(route('api.videos.show', $this->video));

        $response->assertStatus(200)
            ->assertJson(['data' => $this->video->toArray()])
            ->assertJsonStructure([
                'data' => $this->fieldsSerialized
            ]);

        $id = $this->getIdFromResponse($response);
        $video = Video::find($id);
        $this->assertResource($response, new VideoResource($video));
    }

    public function testInvalidationRequired()
    {
        $data = [
            'title' => '',
            'description' => '',
            'year_launched' => '',
            'rating' => '',
            'duration' => '',
            'categories_id' => '',
            'genres_id' => '',
            'cast_members_id' => '',
        ];
        $this->assertInvalidationStoreAction($data, 'required');
        $this->assertInvalidationUpdateAction($data, 'required');
    }

    public function testInvalidationMax()
    {
        $data = ['title' => str_repeat('a', 256)];
        $this->assertInvalidationStoreAction($data, 'max.string', ['max' => '255']);
        $this->assertInvalidationUpdateAction($data, 'max.string', ['max' => '255']);

    }

    public function testInvalidationInteger()
    {
        $data = ['duration' => 's'];
        $this->assertInvalidationStoreAction($data, 'integer');
        $this->assertInvalidationUpdateAction($data, 'integer');
    }

    public function testInvalidationYearLaunchedField()
    {
        $data = ['year_launched' => 'a'];
        $this->assertInvalidationStoreAction($data, 'date_format', ['format' => 'Y']);
        $this->assertInvalidationUpdateAction($data, 'date_format', ['format' => 'Y']);
    }

    public function testInvalidationOpenedField()
    {
        $data = ['opened' => 'd'];
        $this->assertInvalidationStoreAction($data, 'boolean');
        $this->assertInvalidationUpdateAction($data, 'boolean');
    }

    public function testInvalidationRatingField()
    {
        $data = ['rating' => 0];
        $this->assertInvalidationStoreAction($data, 'in');
        $this->assertInvalidationUpdateAction($data, 'in');
    }

    public function testInvalidationCategoriesIdField()
    {
        $data = ['categories_id' => 'a'];
        $this->assertInvalidationStoreAction($data, 'array');
        $this->assertInvalidationUpdateAction($data, 'array');

        $data = ['categories_id' => [100]];
        $this->assertInvalidationStoreAction($data, 'exists');
        $this->assertInvalidationUpdateAction($data, 'exists');

        $category = factory(Category::class)->create();
        $category->delete();
        $data = ['categories_id' => [$category->id]];
        $this->assertInvalidationStoreAction($data, 'exists');
        $this->assertInvalidationUpdateAction($data, 'exists');
    }

    public function testInvalidationGenresIdField()
    {
        $data = ['genres_id' => 'a'];
        $this->assertInvalidationStoreAction($data, 'array');
        $this->assertInvalidationUpdateAction($data, 'array');

        $data = ['genres_id' => [100]];
        $this->assertInvalidationStoreAction($data, 'exists');
        $this->assertInvalidationUpdateAction($data, 'exists');

        $genre = factory(Genre::class)->create();
        $genre->delete();
        $data = ['genres_id' => [$genre->id]];
        $this->assertInvalidationStoreAction($data, 'exists');
        $this->assertInvalidationUpdateAction($data, 'exists');
    }

    public function testSaveWithoutFiles()
    {
        $testData = Arr::except($this->sendData, ['genres_id', 'categories_id', 'cast_members_id']);
        $data = [
            [
                'send_data' => $this->sendData,
                'test_data' => $testData + ['opened' => false]
            ],
            [
                'send_data' => $this->sendData + [
                        'opened' => true,
                    ],
                'test_data' => $testData + ['opened' => true]
            ],
            [
                'send_data' => $this->sendData + [
                        'rating' => Video::RATING_LIST[1],
                    ],
                'test_data' => $testData + ['rating' => Video::RATING_LIST[1]]
            ],
        ];

        foreach ($data as $value) {
            $response = $this->assertStore(
                $value['send_data'],
                $value['test_data'] + ['deleted_at' => null]
            );
            $this->assertHasCategory($this->getIdFromResponse($response), $value['send_data']['categories_id'][0]);
            $this->assertHasGenre($this->getIdFromResponse($response), $value['send_data']['genres_id'][0]);
            $response->assertJsonStructure(['data' => $this->fieldsSerialized]);
            $this->assertResource(
                $response,
                new VideoResource(Video::find($this->getIdFromResponse($response)))
            );

            $response = $this->assertUpdate(
                $value['send_data'],
                $value['test_data'] + ['deleted_at' => null]
            );
            $this->assertHasCategory($this->getIdFromResponse($response), $value['send_data']['categories_id'][0]);
            $this->assertHasGenre($this->getIdFromResponse($response), $value['send_data']['genres_id'][0]);
            $response->assertJsonStructure(['data' => $this->fieldsSerialized]);
            $this->assertResource(
                $response,
                new VideoResource(Video::find($this->getIdFromResponse($response)))
            );
        }
    }

    public function testDestroy()
    {
        $response = $this->deleteJson(route('api.videos.destroy', $this->video));
        $response->assertStatus(204);
        $this->assertNull(Video::find($this->video->id));
        $this->assertNotNull(Video::withTrashed()->find($this->video->id));
    }

    protected function assertHasCategory($videoId, $categoryId)
    {
        $this->assertDatabaseHas('category_video', [
            'video_id' => $videoId,
            'category_id' => $categoryId,
        ]);
    }

    protected function assertHasGenre($videoId, $genreId)
    {
        $this->assertDatabaseHas('genre_video', [
            'video_id' => $videoId,
            'genre_id' => $genreId,
        ]);
    }
}
