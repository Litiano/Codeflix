<?php

namespace App\Rules;

use DB;
use Illuminate\Contracts\Validation\Rule;
use Illuminate\Support\Collection;

class GenresHasCategoriesRule implements Rule
{
    private array $genresId;

    public function __construct(private array $categoriesId)
    {
        $this->categoriesId = array_unique($categoriesId);
    }

    /**
     * Determine if the validation rule passes.
     *
     * @param string $attribute
     * @param mixed  $value
     */
    public function passes($attribute, $value): bool
    {
        if (!is_array($value)) {
            return false;
        }
        $this->genresId = array_unique($value);
        if (!count($this->genresId) || !count($this->categoriesId)) {
            return false;
        }

        $categoriesFound = [];
        foreach ($this->genresId as $genreId) {
            $rows = $this->getRows($genreId);
            if (!$rows->count()) {
                return false;
            }
            array_push($categoriesFound, ...$rows->pluck('category_id')->toArray());
        }

        $categoriesFound = array_unique($categoriesFound);
        if (count($categoriesFound) !== count($this->categoriesId)) {
            return false;
        }

        return true;
    }

    /**
     * Get the validation error message.
     */
    public function message(): string
    {
        return 'A genre ID must be related at least a category ID.';
    }

    protected function getRows($genreId): Collection
    {
        return DB::table('category_genre')
            ->where('genre_id', $genreId)
            ->whereIn('category_id', $this->categoriesId)
            ->get()
        ;
    }
}
