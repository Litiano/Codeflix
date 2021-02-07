<?php


namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Storage;

trait UploadFiles
{
    public array $oldFiles = [];

    public static function bootUploadFiles(): void
    {
        self::updating(function (Model $model) {
            $fieldsUpdated = array_keys($model->getDirty());
            $filesUpdated = array_intersect($fieldsUpdated, self::getFileFields());
            $filesToDelete = Arr::where($filesUpdated, function ($fileField) use ($model) {
                return $model->getOriginal($fileField);
            });
            $model->oldFiles = array_map(function ($fileFiled) use ($model) {
                return $model->getOriginal($fileFiled);
            }, $filesToDelete);
        });
    }

    public function uploadFiles(array $files): void
    {
        foreach ($files as $file) {
            $this->uploadFile($file);
        }
    }

    public function uploadFile(UploadedFile $file): void
    {
        $file->store($this->uploadDir());
    }

    public function deleteOldFiles(): void
    {
        $this->deleteFiles($this->oldFiles);
    }

    public function deleteFiles(array $files): void
    {
        foreach ($files as $file) {
            $this->deleteFile($file);
        }
    }

    public function deleteFile(string|UploadedFile $file): void
    {
        $fileName = $file instanceof UploadedFile ? $file->hashName() : $file;
        Storage::delete("{$this->uploadDir()}/$fileName");
    }

    public static function extractFiles(array &$attributes = []): array
    {
        $files = [];
        foreach (self::getFileFields() as $field) {
            if (isset($attributes[$field]) && $attributes[$field] instanceof UploadedFile) {
                $files[] = $attributes[$field];
                $attributes[$field] = $attributes[$field]->hashName();
            }
        }

        return $files;
    }

    public function relativeFilePath(?string $fileName): string
    {
        return "{$this->uploadDir()}/{$fileName}";
    }

    protected function getFileUrl(string $fileName): string
    {
        return Storage::url($this->relativeFilePath($fileName));
    }

    abstract protected function uploadDir(): string;

    abstract protected static function getFileFields(): array;
}
