<?php

namespace Tests\Unit\Models\Traits;

use Illuminate\Http\UploadedFile;
use Storage;
use Tests\Stubs\Models\UploadFilesStub;
use Tests\TestCase;

class UploadFilesUnitTest extends TestCase
{
    private UploadFilesStub $object;

    protected function setUp(): void
    {
        parent::setUp();
        $this->object = new UploadFilesStub();
    }

    public function testDeleteOldFiles()
    {
        \Storage::fake();
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
        Storage::fake();
        $file = UploadedFile::fake()->create('video.mp4');
        $this->object->uploadFile($file);
        Storage::assertExists("1/{$file->hashName()}");
    }

    public function testUploadFiles()
    {
        Storage::fake();
        $file1 = UploadedFile::fake()->create('video1.mp4');
        $file2 = UploadedFile::fake()->create('video2.mp4');
        $this->object->uploadFiles([$file1, $file2]);
        Storage::assertExists("1/{$file1->hashName()}");
        Storage::assertExists("1/{$file2->hashName()}");
    }

    public function testDeleteFile()
    {
        Storage::fake();
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
        Storage::fake();
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

    public function testExtractFiles()
    {
        $attributes = [];
        $files = $this->object::extractFiles($attributes);
        $this->assertCount(0, $attributes);
        $this->assertCount(0, $files);

        $attributes = ['film' => 'test'];
        $files = $this->object::extractFiles($attributes);
        $this->assertCount(1, $attributes);
        $this->assertCount(0, $files);
        $this->assertEqualsCanonicalizing(['film' => 'test'], $attributes);

        $attributes = ['film' => 'test', 'trailer' => 'test 2'];
        $files = $this->object::extractFiles($attributes);
        $this->assertCount(2, $attributes);
        $this->assertCount(0, $files);
        $this->assertEqualsCanonicalizing(['film' => 'test', 'trailer' => 'test 2'], $attributes);

        $file1 = UploadedFile::fake()->create('video1.mp4');
        $file2 = UploadedFile::fake()->create('video2.mp4');

        $attributes = ['film' => $file1, 'other' => 'test'];
        $files = $this->object::extractFiles($attributes);
        $this->assertCount(2, $attributes);
        $this->assertCount(1, $files);
        $this->assertEqualsCanonicalizing(
            ['film' => $file1->hashName(), 'other' => 'test'],
            $attributes
        );
        $this->assertEqualsCanonicalizing([$file1], $files);

        $attributes = ['film' => $file1, 'trailer' => $file2, 'other' => 'test'];
        $files = $this->object::extractFiles($attributes);
        $this->assertCount(3, $attributes);
        $this->assertCount(2, $files);
        $this->assertEqualsCanonicalizing(
            ['film' => $file1->hashName(), 'trailer' => $file2->hashName(), 'other' => 'test'],
            $attributes
        );
        $this->assertEqualsCanonicalizing([$file1, $file2], $files);
    }
}
