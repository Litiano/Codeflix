<?php

namespace App\Models;


use App\Models\Traits\UploadFiles;
use App\Models\Traits\UuidModel;
use Illuminate\Database\Eloquent\SoftDeletes;

class Video extends UuidModel
{
    use SoftDeletes, UploadFiles;

    const RATING_LIST = ['L', '10', '12', '14', '16', '18'];

    protected $fillable = [
        'title',
        'description',
        'year_launched',
        'opened',
        'rating',
        'duration',
        'video_file',
        'thumb_file',
    ];

    protected $casts = [
        'opened' => 'bool',
        'year_launched' => 'int',
        'duration' => 'int'
    ];

    public static function create(array $attributes = [])
    {
        $files = self::extractFiles($attributes);
        try {
            \DB::beginTransaction();
            /** @var self $obj */
            $obj = static::query()->create($attributes);
            static::handleRelations($obj, $attributes);
            $obj->uploadFiles($files);
            \DB::commit();
            return $obj;
        } catch (\Exception $e) {
            if (isset($obj)) {
                $obj->deleteFiles($files);
            }
            \DB::rollBack();
            throw $e;
        }
    }

    public function update(array $attributes = [], array $options = [])
    {
        $files = self::extractFiles($attributes);
        try {
            \DB::beginTransaction();
            $updated = parent::update($attributes, $options);
            static::handleRelations($this, $attributes);
            if ($updated) {
                $this->uploadFiles($files);
            }
            \DB::commit();
            if ($updated && count($files)) {
                $this->deleteOldFiles();
            }
            return $updated;
        } catch (\Exception $e) {
            \DB::rollBack();
            $this->deleteFiles($files);
            throw $e;
        }
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class);
    }

    public function genres()
    {
        return $this->belongsToMany(Genre::class);
    }

    public static function handleRelations(Video $video, array $attributes)
    {
        if (isset($attributes['categories_id'])) {
            $video->categories()->sync($attributes['categories_id']);
        }
        if (isset($attributes['genres_id'])) {
            $video->genres()->sync($attributes['genres_id']);
        }
    }

    protected function uploadDir():string
    {
        return $this->id;
    }

    public static function getFileFields(): array
    {
        return ['video_file', 'thumb_file'];
    }
}
