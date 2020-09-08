<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends UuidModel
{
    use SoftDeletes;

    protected $fillable = ['name', 'description', 'is_active'];

    protected $casts = [
        'is_active' => 'bool'
    ];
}
