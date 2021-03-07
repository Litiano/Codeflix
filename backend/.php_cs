<?php

$finder = PhpCsFixer\Finder::create()
    ->in(__DIR__.'/app')
    ->in(__DIR__.'/config')
    ->in(__DIR__.'/database')
    ->in(__DIR__.'/resources')
    ->in(__DIR__.'/routes')
    ->in(__DIR__.'/tests')
    ->exclude('bootstrap/cache/*')
    ->notPath('bootstrap/autoload.php')
    ->exclude('*.blade.php')
    ->exclude('*.js')
;

$config = new PhpCsFixer\Config();

return $config->setRules([
    '@PSR2' => true,
    '@PhpCsFixer' => true,
    'array_syntax' => ['syntax' => 'short'],
])
    ->setFinder($finder)
    ->setUsingCache(true)
;
