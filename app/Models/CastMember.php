<?php

namespace App\Models;


use App\Models\Traits\UuidModel;
use Illuminate\Database\Eloquent\SoftDeletes;

class CastMember extends UuidModel
{
    use SoftDeletes;

    public const TYPE_DIRECTOR = 1;
    public const TYPE_ACTOR = 2;

    protected $fillable = ['name', 'type'];
}
