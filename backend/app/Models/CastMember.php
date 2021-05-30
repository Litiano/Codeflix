<?php

namespace App\Models;

use App\ModelFilters\CastMemberFilter;
use App\Models\UuidModel;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * App\Models\CastMember.
 *
 * @property string                          $id
 * @property string                          $name
 * @property int                             $type
 * @property null|\Illuminate\Support\Carbon $deleted_at
 * @property null|\Illuminate\Support\Carbon $created_at
 * @property null|\Illuminate\Support\Carbon $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|CastMember filter(array $input = [], $filter = null)
 * @method static \Illuminate\Database\Eloquent\Builder|CastMember newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|CastMember newQuery()
 * @method static \Illuminate\Database\Query\Builder|CastMember onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder|CastMember paginateFilter($perPage = null, $columns = [], $pageName = 'page', $page = null)
 * @method static \Illuminate\Database\Eloquent\Builder|CastMember query()
 * @method static \Illuminate\Database\Eloquent\Builder|CastMember simplePaginateFilter(?int $perPage = null, ?int $columns = [], ?int $pageName = 'page', ?int $page = null)
 * @method static \Illuminate\Database\Eloquent\Builder|CastMember whereBeginsWith(string $column, string $value, string $boolean = 'and')
 * @method static \Illuminate\Database\Eloquent\Builder|CastMember whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|CastMember whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|CastMember whereEndsWith(string $column, string $value, string $boolean = 'and')
 * @method static \Illuminate\Database\Eloquent\Builder|CastMember whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|CastMember whereLike(string $column, string $value, string $boolean = 'and')
 * @method static \Illuminate\Database\Eloquent\Builder|CastMember whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|CastMember whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|CastMember whereUpdatedAt($value)
 * @method static \Illuminate\Database\Query\Builder|CastMember withTrashed()
 * @method static \Illuminate\Database\Query\Builder|CastMember withoutTrashed()
 * @mixin \Eloquent
 * @method static \Database\Factories\CastMemberFactory factory(...$parameters)
 */
class CastMember extends UuidModel
{
    use SoftDeletes;
    use Filterable;
    use HasFactory;

    public const TYPE_DIRECTOR = 1;
    public const TYPE_ACTOR = 2;

    public static array $types = [
        self::TYPE_DIRECTOR,
        self::TYPE_ACTOR,
    ];

    protected $fillable = ['name', 'type'];

    public function modelFilter(): ?string
    {
        return $this->provideFilter(CastMemberFilter::class);
    }
}
