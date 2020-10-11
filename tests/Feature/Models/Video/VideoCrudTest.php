<?php


namespace Tests\Feature\Models\Video;


use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\QueryException;

class VideoCrudTest extends BaseVideoTestCase
{
    private $fileFieldsData = [];

    protected function setUp(): void
    {
        foreach (Video::getFileFields() as $field) {
            $this->fileFieldsData[$field] = "{$field}.test";
        }
        parent::setUp();
    }

    public function testList()
    {
        factory(Video::class)->create();
        $videos = Video::all();
        $this->assertCount(1, $videos);
        $videoKeys = array_keys($videos->first()->getAttributes());
        $this->assertEqualsCanonicalizing([
            'id',
            'title',
            'description',
            'year_launched',
            'opened',
            'rating',
            'duration',
            'video_file',
            'thumb_file',
            'created_at',
            'updated_at',
            'deleted_at',
        ], $videoKeys);
    }

    public function testCreateWithBasicFields()
    {
        $fileFields = $this->fileFieldsData;
        $video = Video::create($this->data + $fileFields);
        $video->refresh();

        $this->assertEquals(36, strlen($video->id));
        $this->assertFalse($video->opened);
        $this->assertDatabaseHas('videos', $this->data + $fileFields + ['opened' => false]);

        $video = Video::create($this->data + $fileFields + ['opened' => true]);
        $this->assertTrue($video->opened);
        $this->assertDatabaseHas('videos', $this->data + $fileFields + ['opened' => true]);
    }

    public function testCreateWithRelations()
    {
        $category = factory(Category::class)->create();
        $genre = factory(Genre::class)->create();
        $video = Video::create($this->data + [
                'categories_id' => [$category->id],
                'genres_id' => [$genre->id],
            ]
        );
        $this->assertHasCategory($video->id, $category->id);
        $this->assertHasGenre($video->id, $genre->id);
    }

    protected function assertHasCategory($videoId, $categoryId)
    {
        $this->assertDatabaseHas('category_video', [
            'video_id' => $videoId, 'category_id' => $categoryId
        ]);
    }

    protected function assertHasGenre($videoId, $genreId)
    {
        $this->assertDatabaseHas('genre_video', [
            'video_id' => $videoId, 'genre_id' => $genreId
        ]);
    }

    public function testRollbackStore()
    {
        $hasError = false;
        try {
            Video::create([
                'title' => 'title',
                'description' => 'description',
                'year_launched' => 2011,
                'rating' => Video::RATING_LIST[0],
                'duration' => 90,
                'categories_id' => [0 , 1, 2],
            ]);
        } catch (QueryException $e) {
            $hasError = true;
            $this->assertCount(0, Video::all());
        }

        $this->assertTrue($hasError);
    }

    public function testRollbackUpdate()
    {
        $video = factory(Video::class)->create();
        $oldTitle = $video->title;
        $hasError = false;
        try {
            $video->update([
                'title' => 'title',
                'description' => 'description',
                'year_launched' => 2011,
                'rating' => Video::RATING_LIST[0],
                'duration' => 90,
                'categories_id' => [0 , 1, 2],
            ]);
        } catch (QueryException $e) {
            $hasError = true;
            $this->assertDatabaseHas('videos', ['title' => $oldTitle]);
            $this->assertCount(1, Video::all());
        }

        $this->assertTrue($hasError);
    }

    public function testUpdateWithBasicFields()
    {
        $fileFields = $this->fileFieldsData;
        $video = Video::create($this->data + $fileFields + ['opened' => false]);
        $video->update($this->data + $fileFields);
        $this->assertFalse($video->opened);
        $this->assertDatabaseHas('videos', $this->data + $fileFields + ['opened' => false]);

        $video = Video::create($this->data + $fileFields + ['opened' => false]);
        $video->update($this->data + $fileFields + ['opened' => true]);
        $this->assertTrue($video->opened);
        $this->assertDatabaseHas('videos', $this->data + $fileFields + ['opened' => true]);
    }

    public function testUpdateWithRelations()
    {
        $category = factory(Category::class)->create();
        $genre = factory(Genre::class)->create();
        $video = factory(Video::class)->create();
        $video->update([
            'categories_id' => [$category->id],
            'genres_id' => [$genre->id],
        ]);

        $this->assertHasCategory($video->id, $category->id);
        $this->assertHasGenre($video->id, $genre->id);
    }

    public function testHandleRelations()
    {
        $video = factory(Video::class)->create();
        Video::handleRelations($video, []);
        $this->assertCount(0, $video->categories);
        $this->assertCount(0, $video->genres);

        $category = factory(Category::class)->create();
        Video::handleRelations($video, ['categories_id' => [$category->id]]);
        $video->refresh();
        $this->assertCount(1, $video->categories);

        $genre = factory(Genre::class)->create();
        Video::handleRelations($video, ['genres_id' => [$genre->id]]);
        $video->refresh();
        $this->assertCount(1, $video->genres);

        $this->assertCount(1, Category::all());
        $this->assertCount(1, Genre::all());
        $video->categories()->detach();
        $video->genres()->detach();
        $video->refresh();
        $this->assertCount(0, $video->categories);
        $this->assertCount(0, $video->genres);
        $this->assertCount(1, Category::all());
        $this->assertCount(1, Genre::all());

        Video::handleRelations($video, [
            'categories_id' => [$category->id],
            'genres_id' => [$genre->id],
        ]);

        $video->refresh();
        $this->assertCount(1, $video->categories);
        $this->assertCount(1, $video->genres);
    }


    public function testSyncCategories()
    {
        $categoriesId = factory(Category::class, 3)->create()->pluck('id')->toArray();
        $video = factory(Video::class)->create();
        Video::handleRelations($video, ['categories_id' => $categoriesId[0]]);
        $this->assertDatabaseHas('category_video', [
            'category_id' => $categoriesId[0],
            'video_id' => $video->id,
        ]);

        Video::handleRelations($video, [
            'categories_id' => [$categoriesId[1], $categoriesId[2]]
        ]);
        $this->assertDatabaseMissing('category_video', [
            'category_id' => $categoriesId[0],
            'video_id' => $video->id,
        ]);
        $this->assertDatabaseHas('category_video', [
            'category_id' => $categoriesId[1],
            'video_id' => $video->id,
        ]);
        $this->assertDatabaseHas('category_video', [
            'category_id' => $categoriesId[2],
            'video_id' => $video->id,
        ]);
    }

    public function testSyncGenres()
    {
        /** @var Collection|Genre[] $genres */
        $genres = factory(Genre::class, 3)->create();
        $genresId = $genres->pluck('id')->toArray();
        $video = factory(Video::class)->create();
        Video::handleRelations($video, ['genres_id' => $genresId[0]]);
        $this->assertDatabaseHas('genre_video', [
            'genre_id' => $genresId[0],
            'video_id' => $video->id,
        ]);

        Video::handleRelations($video, [
            'genres_id' => [$genresId[1], $genresId[2]]
        ]);
        $this->assertDatabaseMissing('genre_video', [
            'genre_id' => $genresId[0],
            'video_id' => $video->id,
        ]);
        $this->assertDatabaseHas('genre_video', [
            'genre_id' => $genresId[1],
            'video_id' => $video->id,
        ]);
        $this->assertDatabaseHas('genre_video', [
            'genre_id' => $genresId[2],
            'video_id' => $video->id,
        ]);
    }
}
