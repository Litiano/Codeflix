<?php


namespace App\Models\Traits;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Storage;

trait UploadFiles
{
    public array $oldFiles = [];

    public static function bootUploadFiles()
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

    public function uploadFiles(array $files)
    {
        foreach ($files as $file) {
            $this->uploadFile($file);
        }
    }

    public function uploadFile(UploadedFile $file)
    {
        $file->store($this->uploadDir());
    }

    public function deleteOldFiles()
    {
        $this->deleteFiles($this->oldFiles);
    }

    public function deleteFiles(array $files)
    {
        foreach ($files as $file) {
            $this->deleteFile($file);
        }
    }

    /**
     * @param string|UploadedFile $file
     */
    public function deleteFile($file)
    {
        $fileName = $file instanceof UploadedFile ? $file->hashName() : $file;
        Storage::delete("{$this->uploadDir()}/$fileName");
    }

    public static function extractFiles(array &$attributes = [])
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

    public function relativeFilePath(?string $fileName)
    {
        return "{$this->uploadDir()}/{$fileName}";
    }

    protected function getFileUrl(string $fileName)
    {
        return Storage::url($this->relativeFilePath($fileName));
    }

    protected abstract function uploadDir():string;

    protected abstract static function getFileFields():array;
}