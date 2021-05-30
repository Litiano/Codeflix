<?php

namespace Database\Seeders;

use App\Models\CastMember;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class VideoSeeder extends Seeder
{
    protected \Illuminate\Database\Eloquent\Collection $allGenres;
    protected \Illuminate\Database\Eloquent\Collection $allCastMembers;
    private array $relations = [
        'genres_id' => [],
        'categories_id' => [],
        'cast_members_id' => [],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $dir = Storage::getDriver()->getAdapter()->getPathPrefix();
        \File::deleteDirectory($dir, true);

        $this->allGenres = Genre::all();
        $this->allCastMembers = CastMember::all();
        Model::reguard();

        Video::factory()->count(100)
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
            })
        ;
        Model::unguard();
    }

    protected function fetchRelations(): void
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
        $this->relations['cast_members_id'] = $this->allCastMembers->random(3)->pluck('id')->toArray();
    }

    protected function getImageFile(): UploadedFile
    {
        return new UploadedFile(
            storage_path('fakes/thumbs/Laravel Framework.png'),
            'Laravel Framework.png'
        );
    }

    protected function getVideoFile(): UploadedFile
    {
        return new UploadedFile(
            storage_path('fakes/videos/Laravel Framework.mp4'),
            'Laravel Framework.png'
        );
    }
}
