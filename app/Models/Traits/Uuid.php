<?php


namespace App\Models\Traits;


trait Uuid
{
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($obj) {
            $obj->id = \Ramsey\Uuid\Uuid::uuid4()->toString();
        });
    }
}
