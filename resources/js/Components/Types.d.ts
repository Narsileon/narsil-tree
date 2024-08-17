type NodeType = {
	children: NodeType[];
	collapsed?: boolean;
	id: import("@dnd-kit/core").UniqueIdentifier;
};

type NodeModel = {
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
};
