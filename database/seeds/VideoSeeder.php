<?php

use App\Models\Genre;
use App\Models\Video;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;

class VideoSeeder extends Seeder
{
    /**
     * @var \Illuminate\Database\Eloquent\Collection|Genre[]
     */
    protected \Illuminate\Database\Eloquent\Collection $allGenres;
    private array $relations = [];

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $dir = Storage::getDriver()->getAdapter()->getPathPrefix();
        \File::deleteDirectory($dir, true);

        $this->allGenres = Genre::all();
        Model::reguard();

        factory(Video::class, 100)
            ->make()
            ->each(function (Video $video) {
                $this->fetchRelations();
                Video::create(
                    array_merge(
                        $video->toArray(),
                        [
                            'video_file' => $this->getVideoFile(),
                            'thumb_file' => $this->getImageFile(),
                            'trailer_file' => $this->getVideoFile(),
                            'banner_file' => $this->getImageFile(),
                        ],
                        $this->relations
                    )
                );
            });
        Model::unguard();
    }

    protected function fetchRelations()
    {
        $subgenres = $this->allGenres->random(5)->load('categories');
        $categoriesId = [];
        foreach ($subgenres as $genre) {
            array_push($categoriesId, ...$genre->categories->pluck('id')->toArray());
        }
        $categoriesId = array_unique($categoriesId);
        $genresId = $subgenres->pluck('id')->toArray();
        $this->relations['categories_id'] = $categoriesId;
        $this->relations['genres_id'] = $genresId;
    }

    protected function getImageFile()
    {
        return new UploadedFile(
            storage_path('fakes/thumbs/Laravel Framework.png'),
            'Laravel Framework.png'
        );
    }

    protected function getVideoFile()
    {
        return new UploadedFile(
            storage_path('fakes/videos/Laravel Framework.mp4'),
            'Laravel Framework.png'
        );
    }
}
