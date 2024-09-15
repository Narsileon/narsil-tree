<?php

namespace Narsil\Tree\Models;

#region USE

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#endregion

/**
 * @version 1.0.0
 *
 * @author Jonathan Rigaux
 */
abstract class NodeModel extends Model
{
    #region CONSTRUCTOR

    /**
     * @param array $attributes
     * @param string $table
     *
     * @return void
     */
    public function __construct(array $attributes = [])
    {
        $this->guarded = array_merge($this->guarded, [
            self::ID
        ]);

        $this->timestamps = false;

        $this->with = [
            self::RELATIONSHIP_TARGET,
        ];

        parent::__construct($attributes);
    }

    #endregion

    #region CONSTANTS

    /**
     * @var string
     */
    final public const LABEL = 'label';
    /**
     * @var string
     */
    final public const LEFT_ID = 'left_id';
    /**
     * @var string
     */
    final public const ID = 'id';
    /**
     * @var string
     */
    final public const PARENT_ID = 'parent_id';
    /**
     * @var string
     */
    final public const RIGHT_ID = 'right_id';

    /**
     * @var string
     */
    final public const TARGET_ID = 'target_id';
    /**
     * @var string
     */
    final public const TARGET_TYPE = 'target_type';

    /**
     * @var string
     */
    final public const ATTRIBUTE_ENTITY_ID = 'entity_id';
    /**
     * @var string
     */
    final public const ATTRIBUTE_PARENT_ENTITY_ID = 'parent_entity_id';

    /**
     * @var string
     */
    final public const RELATIONSHIP_CHILDREN = 'children';
    /**
     * @var string
     */
    final public const RELATIONSHIP_LEFT = 'left';
    /**
     * @var string
     */
    final public const RELATIONSHIP_LEFTS = 'lefts';
    /**
     * @var string
     */
    final public const RELATIONSHIP_PARENT = 'parent';
    /**
     * @var string
     */
    final public const RELATIONSHIP_RIGHT = 'right';
    /**
     * @var string
     */
    final public const RELATIONSHIP_RIGHTS = 'rights';
    /**
     * @var string
     */
    final public const RELATIONSHIP_TARGET = 'target';

    /**
     * @var string
     */
    public const TABLE = 'nodes';

    #endregion

    #region RELATIONSHIPS

    /**
     * @return HasMany Return the children nodes.
     */
    final public function children(): HasMany
    {
        return $this->hasMany(
            static::class,
            self::PARENT_ID,
            self::ID
        );
    }

    /**
     * @return HasOne Returns the node on the left.
     */
    final public function left(): HasOne
    {
        return $this->hasOne(
            static::class,
            self::ID,
            self::LEFT_ID
        );
    }

    /**
     * @return HasMany Returns the nodes on the left.
     */
    final public function lefts(): HasMany
    {
        return $this->hasMany(
            static::class,
            self::RIGHT_ID,
            self::ID
        );
    }

    /**
     * @return BelongsTo Returns the parent node.
     */
    final public function parent(): BelongsTo
    {
        return $this->belongsTo(
            static::class,
            self::PARENT_ID,
            self::ID
        );
    }

    /**
     * @return HasOne Returns the node on the right.
     */
    final public function right(): HasOne
    {
        return $this->hasOne(
            static::class,
            self::ID,
            self::RIGHT_ID
        );
    }

    /**
     * @return HasMany Returns the nodes on the right.
     */
    final public function rights(): HasMany
    {
        return $this->hasMany(
            static::class,
            self::LEFT_ID,
            self::ID
        );
    }

    /**
     * @return MorphTo
     */
    public function target(): MorphTo
    {
        return $this->morphTo(
            self::RELATIONSHIP_TARGET,
            self::TARGET_TYPE,
            self::TARGET_ID
        );
    }

    #endregion

    #region SCOPES

    /**
     * @param Builder $query
     * @param array $tree
     *
     * @return void
     */
    final public function scopeRebuildTree(Builder $query, array $tree = []): void
    {
        $nodes = $query
            ->with([
                self::RELATIONSHIP_LEFT,
                self::RELATIONSHIP_PARENT,
                self::RELATIONSHIP_RIGHT
            ])
            ->get()
            ->keyBy(self::ID);

        $this->rebuildTreeRecursively($nodes, $tree);
    }

    #endregion

    #region PRIVATE METHODS

    /**
     * @param Collection<integer,NodeModel> $nodes
     * @param array $data
     * @param NodeModel|null $parentNode
     *
     * @return void
     */
    private function rebuildTreeRecursively(Collection $nodes, array $data, NodeModel $parentNode = null): void
    {
        $branchData = collect($data)->keyBy(self::ID);

        $branchNodes = $branchData->keys()->map(function ($id) use ($nodes)
        {
            return $nodes[$id] ?? null;
        })->filter();

        $branchNodes->each(function ($branchNode, $index) use ($branchNodes, $branchData, $nodes, $parentNode)
        {
            $leftNode = $branchNodes->get($index - 1);
            $rightNode = $branchNodes->get($index + 1);

            $branchNode->fill([
                self::LEFT_ID => $leftNode?->{self::ID},
                self::PARENT_ID => $parentNode?->{self::ID},
                self::RIGHT_ID => $rightNode?->{self::ID},
            ]);

            $branchNode->save();

            if ($children = $branchData->get($branchNode->{self::ID})[self::RELATIONSHIP_CHILDREN] ?? null)
            {
                $this->rebuildTreeRecursively($nodes, $children, $branchNode);
            }
        });
    }

    #endregion
}
