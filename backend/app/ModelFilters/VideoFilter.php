<?php

namespace App\ModelFilters;

use Illuminate\Database\Eloquent\Builder;

class VideoFilter extends DefaultModelFilter
{
    protected array $sortable = ['title', 'created_at'];

    public function search(string $search): void
    {
        $this->where('title', 'like', "%{$search}%");
    }

    public function categories(string $categories): void
    {
        $idsOrNames = explode(',', $categories);
        $this->whereHas('categories', function (Builder $builder) use ($idsOrNames) {
            $builder->whereIn('id', $idsOrNames)
                ->orWhereIn('name', $idsOrNames)
            ;
        });
    }

    public function genres(string $genres): void
    {
        $idsOrNames = explode(',', $genres);
        $this->whereHas('genres', function (Builder $builder) use ($idsOrNames) {
            $builder->whereIn('id', $idsOrNames)
                ->orWhereIn('name', $idsOrNames)
            ;
        });
    }
}
