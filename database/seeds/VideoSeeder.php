<?php

use App\Models\Genre;
use App\Models\Video;
use Illuminate\Database\Seeder;

class VideoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $genres = Genre::all();
        factory(Video::class, 100)
            ->create()
            ->each(function (Video $video) use ($genres) {
                $subGenres = $genres->random(5)->load('categories');
                $video->genres()->sync($subGenres);
                foreach ($subGenres as $genre) {
                    $video->categories()->sync($genre->categories, false);
                }
            });
    }
}
