import { ChevronDown, Grab, X } from "lucide-react";
import { cn } from "@narsil-ui/Components";
import * as React from "react";
import Button from "@narsil-ui/Components/Button/Button";

export interface TreeItemProps extends Omit<React.HTMLAttributes<HTMLLIElement>, "id"> {
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

const TreeItem = React.forwardRef<HTMLDivElement, TreeItemProps>(
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
					clone && "pointer-events-none inline-block p-0 pl-[10px] pt-[5px]",
					ghost && "opacity-50",
					indicator && "relative z-[1] -mb-[1px] opacity-100",
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
						"relative box-border flex items-center border border-[#dedede] bg-white px-[10px] py-[var(--vertical-padding)] text-[#222]",
						clone && "rounded-[4px] pr-[24px] shadow-[0px_15px_15px_0_rgba(34,33,81,0.1)]",
						ghost && indicator && "relative h-[8px] border-[#2389ff] bg-[#56a1f8] p-0",
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
								"ease transition-transform duration-[250ms]",
								collapsed && "rotate-[-90deg] transform"
							)}
							onClick={onCollapse}
						>
							<ChevronDown />
						</Button>
					)}
					<span className='flex-grow overflow-hidden truncate pl-[0.5rem]'>{value}</span>
					{!clone && onRemove && (
						<Button onClick={onRemove}>
							<X />
						</Button>
					)}
					{clone && childCount && childCount > 1 ? (
						<span className='absolute -right-[10px] -top-[10px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#2389ff] text-[0.8rem] font-semibold text-white'>
							{childCount}
						</span>
					) : null}
				</div>
			</li>
		);
	}
);

export default TreeItem;
