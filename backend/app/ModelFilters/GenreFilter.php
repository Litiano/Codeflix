<?php


namespace App\ModelFilters;

use Illuminate\Database\Eloquent\Builder;

class GenreFilter extends DefaultModelFilter
{
    protected array $sortable = ['name', 'is_active', 'created_at'];

    public function search(string $search): void
    {
        $this->where('name', 'like', "%{$search}%");
    }

    public function categories(string $categories): void
    {
        $idsOrNames = explode(',', $categories);
        $this->whereHas('categories', function (Builder $builder) use ($idsOrNames) {
            $builder->whereIn('id', $idsOrNames)
                ->orWhereIn('name', $idsOrNames);
        });

        \Log::info($this->toSql());
    }

    public function isActive(bool $isActive): void
    {
        $this->where('is_active', $isActive);
    }
}
