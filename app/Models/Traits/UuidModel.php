<?php


namespace App\Models\Traits;


use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

abstract class UuidModel extends Model
{
    protected $keyType = 'string';

    public $incrementing = false;

    protected static function boot()
    {
        parent::boot();
        static::creating(function (UuidModel $obj) {
            $obj->{$obj->primaryKey} = Uuid::uuid4()->toString();
        });
    }
}
