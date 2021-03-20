<?php


namespace Tests\Feature\Http\Controllers\Api\VideoController;

use App\Models\Video;
use Illuminate\Testing\TestResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;

class VideoControllerUploadsTest extends BaseVideoControllerTestCase
{
    public function testInvalidationThumbField()
    {
        $this->assertInvalidationFile(
            'thumb_file',
            'jpg',
            Video::THUMB_FILE_MAX_SIZE,
            'image',
        );
    }

    public function testInvalidationBannerField()
    {
        $this->assertInvalidationFile(
            'banner_file',
            'jpg',
            Video::BANNER_FILE_MAX_SIZE,
            'image',
        );
    }

    public function testInvalidationTrailerField()
    {
        $this->assertInvalidationFile(
            'trailer_file',
            'mp4',
            Video::TRAILER_FILE_MAX_SIZE,
            'mimetypes',
            ['values' => 'video/mp4']
        );
    }

    public function testInvalidationVideoField()
    {
        $this->assertInvalidationFile(
            'video_file',
            'mp4',
            Video::VIDEO_FILE_MAX_SIZE,
            'mimetypes',
            ['values' => 'video/mp4']
        );
    }

    public function testSaveWithFiles()
    {
        \Storage::fake();
        $files = $this->getFiles();

        $response = $this->postJson(
            $this->routeStore(),
            $this->sendData + $files
        );

        $response->assertStatus(201);
        $this->assertFilesOnPersist($response, $files);
        $this->assertIfFilesUrlExists(Video::find($this->getIdFromResponse($response)), $response);
    }

    public function testUpdateWithFiles()
    {
        \Storage::fake();
        $files = $this->getFiles();

        $response = $this->putJson(
            $this->routeUpdate(),
            $this->sendData + $files
        );

        $response->assertStatus(200);
        $this->assertFilesOnPersist($response, $files);

        $newFiles = [
            'thumb_file' => UploadedFile::fake()->create('new-thumb.jpg'),
            'video_file' => UploadedFile::fake()->create('new-video.mp4'),
        ];
        $response = $this->putJson($this->routeUpdate(), $this->sendData + $newFiles);
        $response->assertStatus(200);
        $this->assertFilesOnPersist($response, Arr::except($files, ['thumb_file', 'video_file']) + $newFiles);
        $this->assertIfFilesUrlExists(Video::find($this->getIdFromResponse($response)), $response);

        $id = $this->getIdFromResponse($response);
        $video = Video::find($id);
        \Storage::assertMissing($video->relativeFilePath($files['thumb_file']->hashName()));
        \Storage::assertMissing($video->relativeFilePath($files['video_file']->hashName()));
    }

    protected function getFiles()
    {
        return [
            'video_file' => UploadedFile::fake()->create('video_file.mp4'),
            'trailer_file' => UploadedFile::fake()->create('trailer_file.mp4'),
            'thumb_file' => UploadedFile::fake()->create('thumb_file.jpg'),
            'banner_file' => UploadedFile::fake()->create('banner_file.jpg'),
        ];
    }

    protected function assertFilesOnPersist(TestResponse $response, array $files)
    {
        $id = $this->getIdFromResponse($response);
        $model = Video::find($id);
        $this->assertFilesExistsInStorage($model, $files);
    }

    protected function assertFilesExistsInStorage($model, array $files)
    {
        /** @var UploadedFile $file */
        foreach ($files as $file) {
            $dir = $model->relativeFilePath($file->hashName());
            \Storage::assertExists($model->relativeFilePath($file->hashName()));
        }
    }
}
