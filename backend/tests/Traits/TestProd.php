<?php


namespace Tests\Traits;


trait TestProd
{
    protected function skipTestIfProd(string $message = '')
    {
        if (!$this->isTestingProd()) {
            $this->markTestSkipped($message);
        }
    }

    protected function isTestingProd():bool
    {
        return env('TEST_PROD') !== false;
    }
}
