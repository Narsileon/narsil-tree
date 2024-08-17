interface TreeItem {
	id: UniqueIdentifier;
	children: TreeItem[];
	collapsed?: boolean;
}
