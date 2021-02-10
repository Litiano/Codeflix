<?php

namespace App\ModelFilters;

use Illuminate\Database\Eloquent\Builder;

class CategoryFilter extends DefaultModelFilter
{
    /**
     * Related Models that have ModelFilters as well as the method on the ModelFilter
     * As [relationMethod => [input_key1, input_key2]].
     *
     * @var array
     */
    public $relations = [];

    protected array $sortable = ['name', 'is_active', 'created_at'];

    public function search(string $search)
    {
        $this->query->where('name', 'like', "%{$search}%");
    }

    public function isActive(bool $isActive): void
    {
        $this->where('is_active', $isActive);
    }

    public function genres(string $genres): void
    {
        $idsOrNames = explode(',', $genres);
        $this->whereHas('genres', function (Builder $builder) use ($idsOrNames) {
            $builder->whereIn('id', $idsOrNames);
        });
    }
}
