<?php

namespace App\ModelFilters;

use EloquentFilter\ModelFilter;
use Illuminate\Support\Str;
use JetBrains\PhpStorm\Pure;

abstract class DefaultModelFilter extends ModelFilter
{
    protected array $sortable = [];

    public function setup(): void
    {
        $this->blacklistMethod('isSortable');
        $noSort = !$this->input('sort');
        if ($noSort) {
            $this->orderBy('created_at', 'desc');
        }
    }

    public function sort(string $column): void
    {
        if (method_exists($this, $method = 'sortBy' . Str::studly($column))) {
            $this->{$method}();
        } elseif ($this->isSortable($column)) {
            $this->orderBy($column, $this->input('dir', 'desc'));
        }
    }

    #[Pure] protected function isSortable(string $column): bool
    {
        return in_array($column, $this->sortable);
    }
}
