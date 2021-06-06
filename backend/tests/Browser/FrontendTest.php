<?php

namespace Tests\Browser;

use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * @internal
 * @coversNothing
 */
class FrontendTest extends DuskTestCase
{
    /**
     * A Dusk test example.
     */
    public function testExample()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/admin/categories')
                ->waitForText('Listagem de categorias', 2)
                ->assertSee('Listagem de categorias')
            ;
        });
    }
}
