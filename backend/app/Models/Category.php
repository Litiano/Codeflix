<?php

namespace App\Models;

use App\ModelFilters\CategoryFilter;
use App\Models\Traits\UuidModel;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * App\Models\Category.
 *
 * @property string                          $id
 * @property string                          $name
 * @property null|string                     $description
 * @property bool                            $is_active
 * @property null|\Illuminate\Support\Carbon $deleted_at
 * @property null|\Illuminate\Support\Carbon $created_at
 * @property null|\Illuminate\Support\Carbon $updated_at
 *
 * @method static \Illuminate\Database\Eloquent\Builder|Category newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Category newQuery()
 * @method static \Illuminate\Database\Query\Builder|Category onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder|Category query()
 * @method static \Illuminate\Database\Eloquent\Builder|Category whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Category whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Category whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Category whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Category whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Category whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Category whereUpdatedAt($value)
 * @method static \Illuminate\Database\Query\Builder|Category withTrashed()
 * @method static \Illuminate\Database\Query\Builder|Category withoutTrashed()
 * @mixin \Eloquent
 */
class Category extends UuidModel
{
    use SoftDeletes;
    use Filterable;

    protected $fillable = ['name', 'description', 'is_active'];

    protected $casts = [
        'is_active' => 'bool',
    ];

    public function modelFilter(): ?string
    {
        return $this->provideFilter(CategoryFilter::class);
    }

    public function genres(): BelongsToMany
    {
        return $this->belongsToMany(Genre::class)->withTrashed();
    }
}
