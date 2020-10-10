<?php


namespace Tests\Feature\Http\Controllers\Api\VideoController;


use App\Models\Category;
use App\Models\Genre;
use Illuminate\Http\UploadedFile;

class VideoControllerUploadsTest extends BaseVideoControllerTestCase
{
    public function testInvalidationVideoField()
    {
        $this->assertInvalidationFile(
            'video_file',
            'mp4',
            5120,
            'mimetypes',
            ['values' => 'video/mp4']
        );
    }

    public function testSaveWithFiles()
    {
        \Storage::fake();
        $files = $this->getFiles();
        /** @var Category $category */
        $category = factory(Category::class)->create();
        /** @var Genre $genre */
        $genre = factory(Genre::class)->create();
        $genre->categories()->sync($category);

        $response = $this->postJson(
            $this->routeStore(),
            $this->sendData +
            [
                'categories_id' => [$category->id],
                'genres_id' => [$genre->id]
            ] +
            $files
        );

        $response->assertStatus(201);
        $id = $response->json('id');
        foreach ($files as $file) {
            \Storage::assertExists("{$id}/{$file->hashName()}");
        }
    }

    public function testUpdateWithFiles()
    {
        \Storage::fake();
        $files = $this->getFiles();
        /** @var Category $category */
        $category = factory(Category::class)->create();
        /** @var Genre $genre */
        $genre = factory(Genre::class)->create();
        $genre->categories()->sync($category);

        $response = $this->putJson(
            $this->routeUpdate(),
            $this->sendData +
            [
                'categories_id' => [$category->id],
                'genres_id' => [$genre->id]
            ] +
            $files
        );

        $response->assertStatus(200);
        $id = $response->json('id');
        foreach ($files as $file) {
            \Storage::assertExists("{$id}/{$file->hashName()}");
        }
    }

    protected function getFiles()
    {
        return [
            'video_file' => UploadedFile::fake()->create('video_file.mp4')
        ];
    }
}
