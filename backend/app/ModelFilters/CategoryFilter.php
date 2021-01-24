<?php

namespace App\ModelFilters;


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
}
