import { AnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as React from "react";
import TreeNode, { TreeNodeProps } from "./TreeNode";
import type { UniqueIdentifier } from "@dnd-kit/core";

export interface SortableTreeNodeProps extends TreeNodeProps {
	id: UniqueIdentifier;
}

const animateLayoutChanges: AnimateLayoutChanges = ({ isSorting, wasDragging }) =>
	isSorting || wasDragging ? false : true;

const TreeNodeSortable = ({ id, depth, ...props }: SortableTreeNodeProps) => {
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
		<TreeNode
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

export default TreeNodeSortable;
