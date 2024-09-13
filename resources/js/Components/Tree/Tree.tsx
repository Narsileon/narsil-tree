import { createPortal } from "react-dom";
import { CSS } from "@dnd-kit/utilities";
import { get } from "lodash";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import * as React from "react";
import keyboardCoordinates from "./keyboardCoordinates";
import TreeNodeSortable from "./TreeNodeSortable";
import type { NodeType } from "@narsil-tree/Types";

import {
	Announcements,
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragStartEvent,
	DragOverlay,
	DragMoveEvent,
	DragEndEvent,
	DragOverEvent,
	MeasuringStrategy,
	DropAnimation,
	Modifier,
	defaultDropAnimation,
	UniqueIdentifier,
} from "@dnd-kit/core";

import {
	buildTree,
	FlattenedItem,
	flattenTree,
	getChildCount,
	getProjection,
	removeChildrenOf,
	removeItem,
	setProperty,
} from "./treeUtils";

export type SensorContext = React.MutableRefObject<{
	items: FlattenedItem[];
	offset: number;
}>;

const measuring = {
	droppable: {
		strategy: MeasuringStrategy.Always,
	},
};

const dropAnimationConfig: DropAnimation = {
	keyframes({ transform }) {
		return [
			{ opacity: 1, transform: CSS.Transform.toString(transform.initial) },
			{
				opacity: 0,
				transform: CSS.Transform.toString({
					...transform.final,
					x: transform.final.x + 5,
					y: transform.final.y + 5,
				}),
			},
		];
	},
	easing: "ease-out",
	sideEffects({ active }) {
		active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
			duration: defaultDropAnimation.duration,
			easing: defaultDropAnimation.easing,
		});
	},
};

export interface SortableTreeProps {
	collapsible?: boolean;
	indentationWidth?: number;
	indicator?: boolean;
	labelKey?: string;
	removable?: boolean;
	value: NodeType[];
	setValue: (value: NodeType[]) => void;
}

export function SortableTree({
	collapsible = true,
	indentationWidth = 2,
	indicator = true,
	labelKey = "id",
	removable,
	value,
	setValue,
}: SortableTreeProps) {
	const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
	const [overId, setOverId] = React.useState<UniqueIdentifier | null>(null);
	const [offsetLeft, setOffsetLeft] = React.useState(0);
	const [currentPosition, setCurrentPosition] = React.useState<{
		parentId: UniqueIdentifier | null;
		overId: UniqueIdentifier;
	} | null>(null);

	const flattenedItems = React.useMemo(() => {
		const flattenedTree = flattenTree(value);
		const collapsedItems = flattenedTree.reduce<string[]>(
			(acc, { children, collapsed, id }) => (collapsed && children.length ? [...acc, id] : acc),
			[]
		);

		return removeChildrenOf(flattenedTree, activeId ? [activeId, ...collapsedItems] : collapsedItems);
	}, [activeId, value]);
	const projected =
		activeId && overId ? getProjection(flattenedItems, activeId, overId, offsetLeft, indentationWidth) : null;
	const sensorContext: SensorContext = React.useRef({
		items: flattenedItems,
		offset: offsetLeft,
	});
	const [coordinateGetter] = React.useState(() => keyboardCoordinates(sensorContext, indicator, indentationWidth));

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter,
		})
	);

	const sortedIds = React.useMemo(() => flattenedItems.map(({ id }) => id), [flattenedItems]);
	const activeItem = activeId ? flattenedItems.find(({ id }) => id === activeId) : null;

	React.useEffect(() => {
		sensorContext.current = {
			items: flattenedItems,
			offset: offsetLeft,
		};
	}, [flattenedItems, offsetLeft]);

	const announcements: Announcements = {
		onDragStart({ active }) {
			return `Picked up ${active.id}.`;
		},
		onDragMove({ active, over }) {
			return getMovementAnnouncement("onDragMove", active.id, over?.id);
		},
		onDragOver({ active, over }) {
			return getMovementAnnouncement("onDragOver", active.id, over?.id);
		},
		onDragEnd({ active, over }) {
			return getMovementAnnouncement("onDragEnd", active.id, over?.id);
		},
		onDragCancel({ active }) {
			return `Moving was cancelled. ${active.id} was dropped in its original position.`;
		},
	};

	return (
		<DndContext
			accessibility={{ announcements }}
			sensors={sensors}
			collisionDetection={closestCenter}
			measuring={measuring}
			onDragStart={handleDragStart}
			onDragMove={handleDragMove}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
			onDragCancel={handleDragCancel}
		>
			<ul>
				<SortableContext
					items={sortedIds}
					strategy={verticalListSortingStrategy}
				>
					{flattenedItems.map((item) => (
						<TreeNodeSortable
							key={item.id}
							id={item.id}
							value={get(item, labelKey)}
							depth={item.id === activeId && projected ? projected.depth : item.depth}
							indentationWidth={indentationWidth}
							indicator={indicator}
							collapsed={Boolean(item.collapsed && item.children.length)}
							onCollapse={collapsible && item.children.length ? () => handleCollapse(item.id) : undefined}
							onRemove={removable ? () => handleRemove(item.id) : undefined}
						/>
					))}
					{createPortal(
						<DragOverlay
							dropAnimation={dropAnimationConfig}
							modifiers={indicator ? [adjustTranslate] : undefined}
						>
							{activeId && activeItem ? (
								<TreeNodeSortable
									id={activeId}
									childCount={getChildCount(value, activeId) + 1}
									clone={true}
									depth={activeItem.depth}
									indentationWidth={indentationWidth}
									value={get(activeItem, labelKey)}
								/>
							) : null}
						</DragOverlay>,
						document.body
					)}
				</SortableContext>
			</ul>
		</DndContext>
	);

	function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
		setActiveId(activeId);
		setOverId(activeId);

		const activeItem = flattenedItems.find(({ id }) => id === activeId);

		if (activeItem) {
			setCurrentPosition({
				parentId: activeItem.parentId,
				overId: activeId,
			});
		}

		document.body.style.setProperty("cursor", "grabbing");
	}

	function handleDragMove({ delta }: DragMoveEvent) {
		setOffsetLeft(delta.x);
	}

	function handleDragOver({ over }: DragOverEvent) {
		setOverId(over?.id ?? null);
	}

	function handleDragEnd({ active, over }: DragEndEvent) {
		resetState();

		if (projected && over) {
			const { depth, parentId } = projected;
			const clonedItems: FlattenedItem[] = JSON.parse(JSON.stringify(flattenTree(value)));
			const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
			const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
			const activeTreeNode = clonedItems[activeIndex];

			clonedItems[activeIndex] = { ...activeTreeNode, depth, parentId };

			const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
			const newItems = buildTree(sortedItems);

			setValue(newItems);
		}
	}

	function handleDragCancel() {
		resetState();
	}

	function resetState() {
		setOverId(null);
		setActiveId(null);
		setOffsetLeft(0);
		setCurrentPosition(null);

		document.body.style.setProperty("cursor", "");
	}

	function handleRemove(id: UniqueIdentifier) {
		setValue(removeItem(value, id));
	}

	function handleCollapse(id: UniqueIdentifier) {
		setValue(
			setProperty(value, id, "collapsed", (value) => {
				return !value;
			})
		);
	}

	function getMovementAnnouncement(eventName: string, activeId: UniqueIdentifier, overId?: UniqueIdentifier) {
		if (overId && projected) {
			if (eventName !== "onDragEnd") {
				if (
					currentPosition &&
					projected.parentId === currentPosition.parentId &&
					overId === currentPosition.overId
				) {
					return;
				} else {
					setCurrentPosition({
						parentId: projected.parentId,
						overId,
					});
				}
			}

			const clonedItems: FlattenedItem[] = JSON.parse(JSON.stringify(flattenTree(value)));
			const overIndex = clonedItems.findIndex(({ id }) => id === overId);
			const activeIndex = clonedItems.findIndex(({ id }) => id === activeId);
			const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

			const previousItem = sortedItems[overIndex - 1];

			let announcement;
			const movedVerb = eventName === "onDragEnd" ? "dropped" : "moved";
			const nestedVerb = eventName === "onDragEnd" ? "dropped" : "nested";

			if (!previousItem) {
				const nextItem = sortedItems[overIndex + 1];
				announcement = `${activeId} was ${movedVerb} before ${nextItem.id}.`;
			} else {
				if (projected.depth > previousItem.depth) {
					announcement = `${activeId} was ${nestedVerb} under ${previousItem.id}.`;
				} else {
					let previousSibling: FlattenedItem | undefined = previousItem;
					while (previousSibling && projected.depth < previousSibling.depth) {
						const parentId: UniqueIdentifier | null = previousSibling.parentId;
						previousSibling = sortedItems.find(({ id }) => id === parentId);
					}

					if (previousSibling) {
						announcement = `${activeId} was ${movedVerb} after ${previousSibling.id}.`;
					}
				}
			}

			return announcement;
		}

		return;
	}
}

const adjustTranslate: Modifier = ({ transform }) => {
	return {
		...transform,
		y: transform.y - 25,
	};
};
