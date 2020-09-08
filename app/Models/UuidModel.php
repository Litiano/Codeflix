<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

abstract class UuidModel extends Model
{
    protected $keyType = 'string';

    public $incrementing = false;

    protected static function boot()
    {
        parent::boot();
        static::creating(function (Model $obj) {
            $obj->{$obj->primaryKey} = Uuid::uuid4()->toString();
        });
    }
}
