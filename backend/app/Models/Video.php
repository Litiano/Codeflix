<?php

namespace App\Models;


use App\Models\Traits\UploadFiles;
use App\Models\Traits\UuidModel;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * App\Models\Video
 *
 * @property string $id
 * @property string $title
 * @property string $description
 * @property int $year_launched
 * @property bool $opened
 * @property string $rating
 * @property int $duration
 * @property string|null $video_file
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Category[] $categories
 * @property-read int|null $categories_count
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Genre[] $genres
 * @property-read int|null $genres_count
 * @method static \Illuminate\Database\Eloquent\Builder|Video newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Video newQuery()
 * @method static \Illuminate\Database\Query\Builder|Video onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder|Video query()
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereDuration($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereOpened($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereRating($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereVideoFile($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereYearLaunched($value)
 * @method static \Illuminate\Database\Query\Builder|Video withTrashed()
 * @method static \Illuminate\Database\Query\Builder|Video withoutTrashed()
 * @mixin \Eloquent
 * @property string|null $thumb_file
 * @property string|null $trailer_file
 * @property string|null $banner_file
 * @property-read string|null $banner_file_url
 * @property-read string|null $thumb_file_url
 * @property-read string|null $trailer_file_url
 * @property-read string|null $video_file_url
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereBannerFile($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereThumbFile($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereTrailerFile($value)
 */
class Video extends UuidModel
{
    use SoftDeletes, UploadFiles;

    public const RATING_LIST = ['L', '10', '12', '14', '16', '18'];

    public const THUMB_FILE_MAX_SIZE = 1024 * 5; // 5MB
    public const BANNER_FILE_MAX_SIZE = 1024 * 10; // 10MB
    public const TRAILER_FILE_MAX_SIZE = 1024 * 1024 * 1; // 1GB
    public const VIDEO_FILE_MAX_SIZE = 1024 * 1024 * 50; // 50GB

    protected $fillable = [
        'title',
        'description',
        'year_launched',
        'opened',
        'rating',
        'duration',
        'video_file',
        'thumb_file',
        'banner_file',
        'trailer_file',
    ];

    protected $casts = [
        'opened' => 'bool',
        'year_launched' => 'int',
        'duration' => 'int'
    ];

    protected $appends = [
        'thumb_file_url',
        'banner_file_url',
        'trailer_file_url',
        'video_file_url',
    ];

    public static function create(array $attributes = []): self
    {
        $files = self::extractFiles($attributes);
        try {
            \DB::beginTransaction();
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

    public function update(array $attributes = [], array $options = []): bool
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

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class)->withTrashed();
    }

    public function genres(): BelongsToMany
    {
        return $this->belongsToMany(Genre::class)->withTrashed();
    }

    public function castMembers(): BelongsToMany
    {
        return $this->belongsToMany(CastMember::class)->withTrashed();
    }

    public static function handleRelations(Video $video, array $attributes): void
    {
        if (isset($attributes['categories_id'])) {
            $video->categories()->sync($attributes['categories_id']);
        }
        if (isset($attributes['genres_id'])) {
            $video->genres()->sync($attributes['genres_id']);
        }
        if (isset($attributes['cast_members_id'])) {
            $video->castMembers()->sync($attributes['cast_members_id']);
        }
    }

    protected function uploadDir():string
    {
        return $this->id;
    }

    public static function getFileFields(): array
    {
        return ['video_file', 'thumb_file', 'banner_file', 'trailer_file'];
    }

    public function getThumbFileUrlAttribute(): ?string
    {
        return $this->thumb_file ? $this->getFileUrl($this->thumb_file) : null;
    }

    public function getBannerFileUrlAttribute(): ?string
    {
        return $this->banner_file ? $this->getFileUrl($this->banner_file) : null;
    }

    public function getTrailerFileUrlAttribute(): ?string
    {
        return $this->trailer_file ? $this->getFileUrl($this->trailer_file) : null;
    }

    public function getVideoFileUrlAttribute(): ?string
    {
        return $this->video_file ? $this->getFileUrl($this->video_file) : null;
    }
}
