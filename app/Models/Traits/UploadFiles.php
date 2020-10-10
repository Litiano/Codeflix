<?php


namespace App\Models\Traits;


use Illuminate\Http\UploadedFile;
use Storage;

trait UploadFiles
{
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

    protected abstract function uploadDir():string;

    protected abstract static function getFileFields():array;
}
