<?php
declare(strict_types=1);

namespace Tests\Traits;


use Illuminate\Foundation\Testing\TestResponse;
use Lang;

trait TestValidations
{
    abstract protected function model():string;
    abstract protected function routeStore():string;
    abstract protected function routeUpdate():string;

    protected function assertInvalidationStoreAction(
        array $data,
        string $rule,
        array $ruleParams = []
    ) {
        $response = $this->postJson($this->routeStore(), $data);
        $fields = array_keys($data);
        $this->assertInvalidationFields($response, $fields, $rule, $ruleParams);
    }

    protected function assertInvalidationUpdateAction(
        array $data,
        string $rule,
        array $ruleParams = []
    ) {
        $response = $this->putJson($this->routeUpdate(), $data);
        $fields = array_keys($data);
        $this->assertInvalidationFields($response, $fields, $rule, $ruleParams);
    }

    protected function assertInvalidationFields(
        TestResponse $response,
        array $fields,
        string $rule,
        array $ruleParams = []
    ) {
        $response->assertStatus(422)
            ->assertJsonValidationErrors($fields);

        foreach ($fields as $field) {
            $response->assertJsonFragment([
                trans(
                    "validation.{$rule}",
                    ['attribute' => $this->getAttributeTranslation($field)] + $ruleParams
                )
            ]);
        }
    }

    private function getAttributeTranslation(string $attribute)
    {
        $field = "validation.attributes.{$attribute}";

        if (Lang::has($field)) {
            return Lang::get($field);
        } else {
            return str_replace('_', ' ', $attribute);
        }
    }
}
