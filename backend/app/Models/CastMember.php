<?php

namespace App\Models;


use App\Models\Traits\UuidModel;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * App\Models\CastMember
 *
 * @property string $id
 * @property string $name
 * @property int $type
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|CastMember newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|CastMember newQuery()
 * @method static \Illuminate\Database\Query\Builder|CastMember onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder|CastMember query()
 * @method static \Illuminate\Database\Eloquent\Builder|CastMember whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|CastMember whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|CastMember whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|CastMember whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|CastMember whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|CastMember whereUpdatedAt($value)
 * @method static \Illuminate\Database\Query\Builder|CastMember withTrashed()
 * @method static \Illuminate\Database\Query\Builder|CastMember withoutTrashed()
 * @mixin \Eloquent
 */
class CastMember extends UuidModel
{
    use SoftDeletes;

    public const TYPE_DIRECTOR = 1;
    public const TYPE_ACTOR = 2;

    protected $fillable = ['name', 'type'];
}
