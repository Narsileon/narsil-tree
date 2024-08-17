import { AnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as React from "react";
import TreeItem, { TreeItemProps } from "./TreeItem";
import type { UniqueIdentifier } from "@dnd-kit/core";

export interface SortableTreeItemProps extends TreeItemProps {
	id: UniqueIdentifier;
}

const animateLayoutChanges: AnimateLayoutChanges = ({ isSorting, wasDragging }) =>
	isSorting || wasDragging ? false : true;

const SortableTreeItem = ({ id, depth, ...props }: SortableTreeItemProps) => {
	const {
		attributes,
		isDragging,
		isSorting,
		listeners,
		transform,
		transition,
		setDraggableNodeRef,
		setDroppableNodeRef,
	} = useSortable({
		id,
		animateLayoutChanges,
	});

	const style: React.CSSProperties = {
		transform: CSS.Translate.toString(transform),
		transition,
	};

	return (
		<TreeItem
			ref={setDraggableNodeRef}
			wrapperRef={setDroppableNodeRef}
			style={style}
			depth={depth}
			ghost={isDragging}
			disableInteraction={isSorting}
			handleProps={{
				...attributes,
				...listeners,
			}}
			{...props}
		/>
	);
};

export default SortableTreeItem;
