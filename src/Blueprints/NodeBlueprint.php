<?php

namespace Narsil\Tree\Blueprints;

#region USE

use Illuminate\Database\Schema\Blueprint;
use Narsil\Tree\Models\NodeModel;

#endregion

/**
 * @version 1.0.0
 *
 * @author Jonathan Rigaux
 */
final class NodeBlueprint
{
    #region PUBLIC METHODS

    /**
     * @param Blueprint $table
     * @param string $column
     *
     * @return void
     */
    public static function define(Blueprint $table, string $tableName): void
    {
        $table
            ->id(NodeModel::ID);
        $table
            ->foreignId(NodeModel::PARENT_ID)
            ->nullable()
            ->constrained($tableName, NodeModel::ID)
            ->nullOnDelete();
        $table
            ->foreignId(NodeModel::LEFT_ID)
            ->nullable()
            ->constrained($tableName, NodeModel::ID)
            ->nullOnDelete();
        $table
            ->foreignId(NodeModel::RIGHT_ID)
            ->nullable()
            ->constrained($tableName, NodeModel::ID)
            ->nullOnDelete();
        $table
            ->trans(NodeModel::LABEL);
    }

    #endregion
}
