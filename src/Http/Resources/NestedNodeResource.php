<?php

namespace Narsil\Tree\Http\Resources;

#region USE

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Narsil\Tree\Models\NodeModel;

#endregion

/**
 * @version 1.0.0
 *
 * @author Jonathan Rigaux
 */
class NestedNodeResource extends JsonResource
{
    #region PUBLIC METHODS

    public function toArray(Request $request)
    {
        return [
            NodeModel::ID => $this->{NodeModel::ID},

            NodeModel::RELATIONSHIP_CHILDREN => $this->{NodeModel::RELATIONSHIP_CHILDREN},
            NodeModel::RELATIONSHIP_TARGET => $this->{NodeModel::RELATIONSHIP_TARGET},
        ];
    }

    #endregion
}
