<?php


namespace Tests\Traits;

use Illuminate\Http\UploadedFile;

trait TestUploads
{
    public function assertInvalidationFile(string $field, string $extension, int $maxSize, string $rule, array $ruleParams = [])
    {
        $routes = [
            [
                'method' => 'POST',
                'route' => $this->routeStore()
            ],
            [
                'method' => 'PUT',
                'route' => $this->routeUpdate()
            ],
        ];

        foreach ($routes as $route) {
            $file = UploadedFile::fake()->create("{$field}.a{$extension}");
            $response = $this->json($route['method'], $route['route'], [
                $field => $file
            ]);

            $this->assertInvalidationFields($response, [$field], $rule, $ruleParams);

            $file = UploadedFile::fake()->create("{$field}.{$extension}")->size($maxSize + 1);
            $response = $this->json($route['method'], $route['route'], [
                $field => $file
            ]);
            $this->assertInvalidationFields($response, [$field], 'max.file', ['max' => $maxSize]);
        }
    }
}
