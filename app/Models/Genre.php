<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;

class Genre extends UuidModel
{
    use SoftDeletes;

    protected $fillable = ['name', 'is_active'];

    protected $casts = [
        'is_active' => 'bool'
    ];
}
