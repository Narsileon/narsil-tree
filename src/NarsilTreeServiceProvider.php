<?php

namespace Narsil\Tree;

#region USE

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\ServiceProvider;
use Narsil\Tree\Blueprints\NodeBlueprint;

#endregion

/**
 * @version 1.0.0
 *
 * @author Jonathan Rigaux
 */
final class NarsilTreeServiceProvider extends ServiceProvider
{
    #region PUBLIC METHODS

    /**
     * @return void
     */
    public function boot(): void
    {
        $this->bootBlueprints();
    }

    #endregion

    #region PRIVATE METHODS

    /**
     * @return void
     */
    private function bootBlueprints(): void
    {
        Blueprint::macro('node', function (string $column)
        {
            NodeBlueprint::define($this, $column);
        });
    }

    #endregion
}
