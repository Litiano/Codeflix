<?php

namespace App\ModelFilters;

use App\Models\CastMember;

class CastMemberFilter extends DefaultModelFilter
{
    protected array $sortable = ['name', 'type', 'created_at'];

    public function search(string $search): void
    {
        $this->where('name', 'like', "%{$search}%");
    }

    public function type(int $type): void
    {
        if (in_array($type, CastMember::$types)) {
            $this->orWhere('type', $type);
        }
    }
}
