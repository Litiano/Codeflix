<?php


namespace Tests\Feature\Models\Video;


use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

abstract class BaseVideoTestCase extends TestCase
{
    use DatabaseMigrations;

    protected array $data;

    protected function setUp(): void
    {
        $this->data = [
            'title' => 'title',
            'description' => 'description',
            'year_launched' => 2011,
            'rating' => Video::RATING_LIST[0],
            'duration' => 90,
        ];
        parent::setUp();
    }
}
