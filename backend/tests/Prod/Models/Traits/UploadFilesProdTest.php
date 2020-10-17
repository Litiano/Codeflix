<?php

namespace Tests\Prod\Models\Traits;

use Illuminate\Http\UploadedFile;
use Storage;
use Tests\Stubs\Models\UploadFilesStub;
use Tests\TestCase;
use Tests\Traits\TestProd;
use Tests\Traits\TestStorages;

class UploadFilesProdTest extends TestCase
{
    use TestStorages, TestProd;
    private UploadFilesStub $object;

    protected function setUp(): void
    {
        parent::setUp();
        $this->skipTestIfProd();
        $this->object = new UploadFilesStub();
        \Config::set('filesystems.default', config('filesystems.cloud'));
        $this->deleteAllFiles();
    }

    public function testDeleteOldFiles()
    {
        $file1 = UploadedFile::fake()->create('video1.mp4')->size(1);
        $file2 = UploadedFile::fake()->create('video2.mp4')->size(2);
        $this->object->uploadFiles([$file1, $file2]);
        $this->object->deleteOldFiles();
        $this->assertCount(2, \Storage::allFiles());

        $this->object->oldFiles = [$file1->hashName()];
        $this->object->deleteOldFiles();
        \Storage::assertMissing("1/{$file1->hashName()}");
        \Storage::assertExists("1/{$file2->hashName()}");
    }

    public function testUploadFile()
    {
        $file = UploadedFile::fake()->create('video.mp4');
        $this->object->uploadFile($file);
        Storage::assertExists("1/{$file->hashName()}");
    }

    public function testUploadFiles()
    {
        $file1 = UploadedFile::fake()->create('video1.mp4');
        $file2 = UploadedFile::fake()->create('video2.mp4');
        $this->object->uploadFiles([$file1, $file2]);
        Storage::assertExists("1/{$file1->hashName()}");
        Storage::assertExists("1/{$file2->hashName()}");
    }

    public function testDeleteFile()
    {
        $file = UploadedFile::fake()->create('video.mp4');
        $this->object->uploadFile($file);
        $fileName = $file->hashName();
        Storage::assertExists("1/{$fileName}");
        $this->object->deleteFile($file->hashName());
        Storage::assertMissing("1/{$fileName}");

        $this->object->uploadFile($file);
        $fileName = $file->hashName();
        Storage::assertExists("1/{$fileName}");
        $this->object->deleteFile($file);
        Storage::assertMissing("1/{$fileName}");
    }

    public function testDeleteFiles()
    {
        $file1 = UploadedFile::fake()->create('video1.mp4');
        $file2 = UploadedFile::fake()->create('video2.mp4');
        $this->object->uploadFiles([$file1, $file2]);

        $fileName1 = $file1->hashName();
        $fileName2 = $file2->hashName();
        Storage::assertExists("1/{$fileName1}");
        Storage::assertExists("1/{$fileName2}");
        $this->object->deleteFiles([$fileName1, $fileName2]);
        Storage::assertMissing("1/{$fileName1}");
        Storage::assertMissing("1/{$fileName2}");

        $this->object->uploadFiles([$file1, $file2]);
        $fileName1 = $file1->hashName();
        $fileName2 = $file2->hashName();
        Storage::assertExists("1/{$fileName1}");
        Storage::assertExists("1/{$fileName2}");
        $this->object->deleteFiles([$file1, $file2]);
        Storage::assertMissing("1/{$fileName1}");
        Storage::assertMissing("1/{$fileName2}");

        $this->object->uploadFiles([$file1, $file2]);
        $fileName1 = $file1->hashName();
        $fileName2 = $file2->hashName();
        Storage::assertExists("1/{$fileName1}");
        Storage::assertExists("1/{$fileName2}");
        $this->object->deleteFiles([$file1, $fileName2]);
        Storage::assertMissing("1/{$fileName1}");
        Storage::assertMissing("1/{$fileName2}");
    }
}
