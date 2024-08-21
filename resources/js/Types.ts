import { UniqueIdentifier } from "@dnd-kit/core";

export type NodeType = {
	children: NodeType[];
	collapsed?: boolean;
	id: UniqueIdentifier;
};

export type NodeModel<T = any> = {
	children: NodeModel[];
	id: number;
	label: string | null;
	left_id: number | null;
	left?: NodeModel | null;
	lefts?: NodeModel[];
	parent_id: number | null;
	parent?: NodeModel | null;
	right_id: number | null;
	right?: NodeModel | null;
	rights?: NodeModel[];
	target_id: number | null;
	target_type: string | null;
	target: T;
};
