<?php


namespace Tests\Feature\Http\Controllers\Api\VideoController;

use App\Models\CastMember;
use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;
use Tests\Traits\TestResources;
use Tests\Traits\TestSaves;
use Tests\Traits\TestUploads;
use Tests\Traits\TestValidations;

abstract class BaseVideoControllerTestCase extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves, TestUploads, TestResources;

    protected Video $video;

    protected array $sendData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->video = Video::factory()->create(['opened' => false]);
        $category = Category::factory()->create();
        $genre = Genre::factory()->create();
        $castMember = CastMember::factory()->create();
        $genre->categories()->sync($category);
        $this->sendData = [
            'title' => 'title',
            'description' => 'description',
            'year_launched' => 2011,
            'rating' => Video::RATING_LIST[0],
            'duration' => 90,
            'genres_id' => [$genre->id],
            'categories_id' => [$category->id],
            'cast_members_id' => [$castMember->id],
        ];
    }

    protected function routeStore(): string
    {
        return route('api.videos.store');
    }

    protected function routeUpdate(): string
    {
        return route('api.videos.update', $this->video);
    }

    protected function model(): string
    {
        return Video::class;
    }

    protected function assertIfFilesUrlExists(Video $video, TestResponse $response)
    {
        $fileFields = Video::getFileFields();
        $data = $response->json('data');
        $data = array_key_exists(0, $data) ? $data[0] : $data;
        foreach ($fileFields as $field) {
            $file = $video->{$field};
            $this->assertEquals(
                \Storage::url($video->relativeFilePath($file)),
                $data[$field . '_url']
            );
        }
    }
}
