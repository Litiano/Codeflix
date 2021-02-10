<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Models\Category;
use Faker\Generator as Faker;

$factory->define(Category::class, function (Faker $faker) {
    return [
        'name' => $faker->colorName,
        'description' => 0 === rand(1, 10) % 2 ? $faker->sentence : null,
    ];
});
