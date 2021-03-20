<?php

namespace App\Models;

use App\ModelFilters\GenreFilter;
use App\Models\UuidModel;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * App\Models\Genre.
 *
 * @property string                                                          $id
 * @property string                                                          $name
 * @property bool                                                            $is_active
 * @property null|\Illuminate\Support\Carbon                                 $deleted_at
 * @property null|\Illuminate\Support\Carbon                                 $created_at
 * @property null|\Illuminate\Support\Carbon                                 $updated_at
 * @property \App\Models\Category[]|\Illuminate\Database\Eloquent\Collection $categories
 * @property null|int                                                        $categories_count
 * @method static \Illuminate\Database\Eloquent\Builder|Genre filter(array $input = [], $filter = null)
 * @method static \Illuminate\Database\Eloquent\Builder|Genre newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Genre newQuery()
 * @method static \Illuminate\Database\Query\Builder|Genre onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder|Genre paginateFilter($perPage = null, $columns = [], $pageName = 'page', $page = null)
 * @method static \Illuminate\Database\Eloquent\Builder|Genre query()
 * @method static \Illuminate\Database\Eloquent\Builder|Genre simplePaginateFilter(?int $perPage = null, ?int $columns = [], ?int $pageName = 'page', ?int $page = null)
 * @method static \Illuminate\Database\Eloquent\Builder|Genre whereBeginsWith(string $column, string $value, string $boolean = 'and')
 * @method static \Illuminate\Database\Eloquent\Builder|Genre whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Genre whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Genre whereEndsWith(string $column, string $value, string $boolean = 'and')
 * @method static \Illuminate\Database\Eloquent\Builder|Genre whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Genre whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Genre whereLike(string $column, string $value, string $boolean = 'and')
 * @method static \Illuminate\Database\Eloquent\Builder|Genre whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Genre whereUpdatedAt($value)
 * @method static \Illuminate\Database\Query\Builder|Genre withTrashed()
 * @method static \Illuminate\Database\Query\Builder|Genre withoutTrashed()
 * @mixin \Eloquent
 * @method static \Database\Factories\GenreFactory factory(...$parameters)
 */
class Genre extends UuidModel
{
    use SoftDeletes;
    use Filterable;
    use HasFactory;

    protected $fillable = ['name', 'is_active'];

    protected $casts = [
        'is_active' => 'bool',
    ];

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    public function modelFilter(): ?string
    {
        return $this->provideFilter(GenreFilter::class);
    }
}
