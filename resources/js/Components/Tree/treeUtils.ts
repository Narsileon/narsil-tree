import { arrayMove } from "@dnd-kit/sortable";
import type { NodeType } from "@narsil-tree/Types";
import type { UniqueIdentifier } from "@dnd-kit/core";

export interface FlattenedItem extends NodeType {
	parentId: UniqueIdentifier | null;
	depth: number;
	index: number;
}

function getDragDepth(offset: number, indentationWidth: number) {
	return Math.round(offset / indentationWidth);
}

export function getProjection(
	items: FlattenedItem[],
	activeId: UniqueIdentifier,
	overId: UniqueIdentifier,
	dragOffset: number,
	indentationWidth: number
) {
	const overItemIndex = items.findIndex(({ id }) => id === overId);
	const activeItemIndex = items.findIndex(({ id }) => id === activeId);
	const activeItem = items[activeItemIndex];
	const newItems = arrayMove(items, activeItemIndex, overItemIndex);
	const previousItem = newItems[overItemIndex - 1];
	const nextItem = newItems[overItemIndex + 1];
	const dragDepth = getDragDepth(dragOffset, indentationWidth);
	const projectedDepth = activeItem.depth + dragDepth;
	const maxDepth = getMaxDepth({
		previousItem,
	});
	const minDepth = getMinDepth({ nextItem });
	let depth = projectedDepth;

	if (projectedDepth >= maxDepth) {
		depth = maxDepth;
	} else if (projectedDepth < minDepth) {
		depth = minDepth;
	}

	return { depth, maxDepth, minDepth, parentId: getParentId() };

	function getParentId() {
		if (depth === 0 || !previousItem) {
			return null;
		}

		if (depth === previousItem.depth) {
			return previousItem.parentId;
		}

		if (depth > previousItem.depth) {
			return previousItem.id;
		}

		const newParent = newItems
			.slice(0, overItemIndex)
			.reverse()
			.find((item) => item.depth === depth)?.parentId;

		return newParent ?? null;
	}
}

function getMaxDepth({ previousItem }: { previousItem: FlattenedItem }) {
	return previousItem ? previousItem.depth + 1 : 0;
}

function getMinDepth({ nextItem }: { nextItem: FlattenedItem }) {
	return nextItem ? nextItem.depth : 0;
}

function flatten(items: NodeType[], parentId: UniqueIdentifier | null = null, depth = 0): FlattenedItem[] {
	return items.reduce<FlattenedItem[]>((acc, item, index) => {
		return [...acc, { ...item, parentId, depth, index }, ...flatten(item.children, item.id, depth + 1)];
	}, []);
}

export function flattenTree(items: NodeType[]): FlattenedItem[] {
	return flatten(items);
}

export function buildTree(flattenedItems: FlattenedItem[]): NodeType[] {
	const root: NodeType = { id: "root", children: [] };
	const nodes: Record<string, NodeType> = { [root.id]: root };
	const items = flattenedItems.map((item) => ({ ...item, children: [] }));

	for (const item of items) {
		const { id, children } = item;
		const parentId = item.parentId ?? root.id;
		const parent = nodes[parentId] ?? findItem(items, parentId);

		nodes[id] = { id, children };
		parent.children.push(item);
	}

	return root.children;
}

export function findItem(items: NodeType[], itemId: UniqueIdentifier) {
	return items.find(({ id }) => id === itemId);
}

export function findItemDeep(items: NodeType[], itemId: UniqueIdentifier): NodeType | undefined {
	for (const item of items) {
		const { id, children } = item;

		if (id === itemId) {
			return item;
		}

		if (children.length) {
			const child = findItemDeep(children, itemId);

			if (child) {
				return child;
			}
		}
	}

	return undefined;
}

export function removeItem(items: NodeType[], id: UniqueIdentifier) {
	const newItems = [];

	for (const item of items) {
		if (item.id === id) {
			continue;
		}

		if (item.children.length) {
			item.children = removeItem(item.children, id);
		}

		newItems.push(item);
	}

	return newItems;
}

export function setProperty<T extends keyof NodeType>(
	items: NodeType[],
	id: UniqueIdentifier,
	property: T,
	setter: (value: NodeType[T]) => NodeType[T]
) {
	for (const item of items) {
		if (item.id === id) {
			item[property] = setter(item[property]);
			continue;
		}

		if (item.children.length) {
			item.children = setProperty(item.children, id, property, setter);
		}
	}

	return [...items];
}

function countChildren(items: NodeType[], count = 0): number {
	return items.reduce((acc, { children }) => {
		if (children.length) {
			return countChildren(children, acc + 1);
		}

		return acc + 1;
	}, count);
}

export function getChildCount(items: NodeType[], id: UniqueIdentifier) {
	const item = findItemDeep(items, id);

	return item ? countChildren(item.children) : 0;
}

export function removeChildrenOf(items: FlattenedItem[], ids: UniqueIdentifier[]) {
	const excludeParentIds = [...ids];

	return items.filter((item) => {
		if (item.parentId && excludeParentIds.includes(item.parentId)) {
			if (item.children.length) {
				excludeParentIds.push(item.id);
			}
			return false;
		}

		return true;
	});
}
