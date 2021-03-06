<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\CastMemberResource;
use App\Models\CastMember;
use Illuminate\Http\Resources\Json\JsonResource;

class CastMemberController extends BasicCrudController
{
    private array $rules;

    public function __construct()
    {
        $this->rules = [
            'name' => 'required|max:255',
            'type' => 'required|in:' . implode(',', [CastMember::TYPE_DIRECTOR, CastMember::TYPE_ACTOR])
        ];
    }

    protected function model(): string
    {
        return CastMember::class;
    }

    protected function rulesStore(): array
    {
        return $this->rules;
    }

    protected function rulesUpdate(): array
    {
        return $this->rules;
    }

    protected function resource(): string|JsonResource
    {
        return CastMemberResource::class;
    }

    protected function resourceCollection(): string|JsonResource
    {
        return $this->resource();
    }
}
