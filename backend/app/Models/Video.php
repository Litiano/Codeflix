<?php

namespace App\Models;

use App\Models\Traits\UploadFiles;
use App\Models\UuidModel;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * App\Models\Video.
 *
 * @property string                                                            $id
 * @property string                                                            $title
 * @property string                                                            $description
 * @property int                                                               $year_launched
 * @property bool                                                              $opened
 * @property string                                                            $rating
 * @property int                                                               $duration
 * @property null|string                                                       $video_file
 * @property null|string                                                       $thumb_file
 * @property null|string                                                       $trailer_file
 * @property null|string                                                       $banner_file
 * @property null|\Illuminate\Support\Carbon                                   $deleted_at
 * @property null|\Illuminate\Support\Carbon                                   $created_at
 * @property null|\Illuminate\Support\Carbon                                   $updated_at
 * @property \App\Models\CastMember[]|\Illuminate\Database\Eloquent\Collection $castMembers
 * @property null|int                                                          $cast_members_count
 * @property \App\Models\Category[]|\Illuminate\Database\Eloquent\Collection   $categories
 * @property null|int                                                          $categories_count
 * @property \App\Models\Genre[]|\Illuminate\Database\Eloquent\Collection      $genres
 * @property null|int                                                          $genres_count
 * @property null|string                                                       $banner_file_url
 * @property null|string                                                       $thumb_file_url
 * @property null|string                                                       $trailer_file_url
 * @property null|string                                                       $video_file_url
 * @method static \Illuminate\Database\Eloquent\Builder|Video filter(array $input = [], $filter = null)
 * @method static \Illuminate\Database\Eloquent\Builder|Video newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Video newQuery()
 * @method static \Illuminate\Database\Query\Builder|Video onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder|Video paginateFilter($perPage = null, $columns = [], $pageName = 'page', $page = null)
 * @method static \Illuminate\Database\Eloquent\Builder|Video query()
 * @method static \Illuminate\Database\Eloquent\Builder|Video simplePaginateFilter(?int $perPage = null, ?int $columns = [], ?int $pageName = 'page', ?int $page = null)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereBannerFile($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereBeginsWith(string $column, string $value, string $boolean = 'and')
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereDuration($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereEndsWith(string $column, string $value, string $boolean = 'and')
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereLike(string $column, string $value, string $boolean = 'and')
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereOpened($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereRating($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereThumbFile($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereTrailerFile($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereVideoFile($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Video whereYearLaunched($value)
 * @method static \Illuminate\Database\Query\Builder|Video withTrashed()
 * @method static \Illuminate\Database\Query\Builder|Video withoutTrashed()
 * @mixin \Eloquent
 * @method static \Database\Factories\VideoFactory factory(...$parameters)
 */
class Video extends UuidModel
{
    use SoftDeletes;
    use UploadFiles;
    use Filterable;
    use HasFactory;

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
        'duration' => 'int',
    ];

    protected $appends = [
        'thumb_file_url',
        'banner_file_url',
        'trailer_file_url',
        'video_file_url',
    ];

    protected $hidden = [
        'thumb_file',
        'banner_file',
        'trailer_file',
        'video_file',
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

    protected function uploadDir(): string
    {
        return $this->id;
    }
}
