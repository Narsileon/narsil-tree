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
class FlatNodeResource extends JsonResource
{
    #region PUBLIC METHODS

    public function toArray(Request $request)
    {
        return [
            NodeModel::ID => $this->{NodeModel::ID},
            NodeModel::PARENT_ID => $this->{NodeModel::PARENT_ID},

            NodeModel::RELATIONSHIP_TARGET => $this->{NodeModel::RELATIONSHIP_TARGET},
        ];
    }

    #endregion
}
