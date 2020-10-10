<?php


namespace Tests\Feature\Http\Controllers\Api\VideoController;


use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;
use Tests\Traits\TestSaves;
use Tests\Traits\TestUploads;
use Tests\Traits\TestValidations;

abstract class BaseVideoControllerTestCase extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves, TestUploads;

    protected Video $video;

    protected array $sendData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->video = factory(Video::class)->create(['opened' => false]);
        $this->sendData = [
            'title' => 'title',
            'description' => 'description',
            'year_launched' => 2011,
            'rating' => Video::RATING_LIST[0],
            'duration' => 90,
        ];
    }

    protected function routeStore()
    {
        return route('api.videos.store');
    }

    protected function routeUpdate()
    {
        return route('api.videos.update', $this->video);
    }

    protected function model()
    {
        return Video::class;
    }
}
