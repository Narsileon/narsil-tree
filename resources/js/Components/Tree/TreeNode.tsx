import { ChevronDown, Grab, X } from "lucide-react";
import { cn } from "@narsil-ui/Components";
import * as React from "react";
import Button from "@narsil-ui/Components/Button/Button";

export interface TreeNodeProps extends Omit<React.HTMLAttributes<HTMLLIElement>, "id"> {
	childCount?: number;
	clone?: boolean;
	collapsed?: boolean;
	depth: number;
	disableInteraction?: boolean;
	disableSelection?: boolean;
	ghost?: boolean;
	handleProps?: any;
	indentationWidth: number;
	indicator?: boolean;
	value: string;
	onCollapse?(): void;
	onRemove?(): void;
	wrapperRef?(node: HTMLLIElement): void;
}

const TreeNode = React.forwardRef<HTMLDivElement, TreeNodeProps>(
	(
		{
			childCount,
			clone,
			depth,
			disableSelection,
			disableInteraction,
			ghost,
			handleProps,
			indentationWidth,
			indicator,
			collapsed,
			onCollapse,
			onRemove,
			style,
			value,
			wrapperRef,
			...props
		},
		ref
	) => {
		return (
			<li
				className={cn(
					"box-border list-none",
					clone && "pointer-events-none inline-block p-0 pl-2 pt-1",
					ghost && "opacity-50",
					indicator && "relative z-10 -mb-[1px] opacity-100",
					disableSelection && "select-none",
					disableInteraction && "pointer-events-none"
				)}
				ref={wrapperRef}
				style={
					{
						"--spacing": `${indentationWidth * depth}px`,
					} as React.CSSProperties
				}
				{...props}
			>
				<div
					className={cn(
						"relative box-border flex items-center border bg-white px-2 py-[var(--vertical-padding)] text-[#222]",
						clone && "rounded pr-6 shadow",
						ghost && indicator && "relative h-2 border-[#2389ff] bg-[#56a1f8] p-0",
						ghost && !indicator && "bg-transparent shadow-none"
					)}
					ref={ref}
					style={style}
				>
					<Button {...handleProps}>
						<Grab />
					</Button>

					{onCollapse && (
						<Button
							className={cn(
								"ease transition-transform duration-300",
								collapsed && "rotate-[-90deg] transform"
							)}
							onClick={onCollapse}
						>
							<ChevronDown />
						</Button>
					)}
					<span className='flex-grow overflow-hidden truncate pl-2'>{value}</span>
					{!clone && onRemove && (
						<Button onClick={onRemove}>
							<X />
						</Button>
					)}
					{clone && childCount && childCount > 1 ? (
						<span className='absolute -right-[10px] -top-[10px] flex h-6 w-6 items-center justify-center rounded-full bg-[#2389ff] text-sm font-semibold text-white'>
							{childCount}
						</span>
					) : null}
				</div>
			</li>
		);
	}
);

export default TreeNode;
