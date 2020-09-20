<?php

namespace App\Models;


use Illuminate\Database\Eloquent\SoftDeletes;

class Video extends UuidModel
{
    use SoftDeletes;

    const RATING_LIST = ['L', '10', '12', '14', '16', '18'];

    protected $fillable = ['title', 'description', 'year_launched', 'opened', 'rating', 'duration'];

    protected $casts = [
        'opened' => 'bool',
        'year_launched' => 'int',
        'duration' => 'int'
    ];

    public function categories()
    {
        return $this->belongsToMany(Category::class);
    }

    public function genres()
    {
        return $this->belongsToMany(Genre::class);
    }
}
