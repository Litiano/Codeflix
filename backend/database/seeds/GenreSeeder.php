<?php

use App\Models\Category;
use App\Models\Genre;
use Illuminate\Database\Seeder;

class GenreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = Category::all();
        factory(Genre::class, 100)
            ->create()
            ->each(function (Genre $genre) use ($categories) {
                $genre->categories()->sync($categories->random(5));
            })
        ;
    }
}
