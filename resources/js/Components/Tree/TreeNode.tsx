import { ChevronDown, Ellipsis, GripVertical } from "lucide-react";
import { cn } from "@narsil-ui/Components";
import { useTranslationsStore } from "@narsil-localization/Stores/translationStore";
import * as React from "react";
import Button from "@narsil-ui/Components/Button/Button";
import DropdownMenu from "@narsil-ui/Components/DropdownMenu/DropdownMenu";
import DropdownMenuContent from "@narsil-ui/Components/DropdownMenu/DropdownMenuContent";
import DropdownMenuItem from "@narsil-ui/Components/DropdownMenu/DropdownMenuItem";
import DropdownMenuTrigger from "@narsil-ui/Components/DropdownMenu/DropdownMenuTrigger";

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
			collapsed,
			depth,
			disableInteraction,
			disableSelection,
			ghost,
			handleProps,
			indentationWidth,
			indicator,
			style,
			value,
			onCollapse,
			onRemove,
			wrapperRef,
			...props
		},
		ref
	) => {
		const { trans } = useTranslationsStore();

		return (
			<li
				ref={wrapperRef}
				className={cn(
					"box-border",
					clone && "pointer-events-none inline-block p-0 pl-2 pt-1",
					ghost && "opacity-50",
					indicator && "relative z-10 -mb-[1px] opacity-100",
					disableSelection && "select-none",
					disableInteraction && "pointer-events-none"
				)}
				style={
					{
						paddingLeft: `${depth * indentationWidth}rem`,
					} as React.CSSProperties
				}
				{...props}
			>
				<div
					ref={ref}
					className={cn(
						"bg-card text-card-foreground relative box-border flex items-center gap-x-3.5 rounded-md border",
						clone && "rounded pr-3.5 shadow",
						ghost && indicator && "bg-primary relative h-2",
						ghost && !indicator && "bg-transparent shadow-none"
					)}
					style={style}
				>
					<Button
						className={cn("w-8 min-w-8 rounded-r-none", { "opacity-0": ghost && indicator })}
						size='icon'
						type='button'
						variant='secondary'
						{...handleProps}
					>
						<GripVertical className='h-5 w-5' />
					</Button>
					<div className={cn("flex grow items-center gap-x-2", { "opacity-0": ghost && indicator })}>
						<span className='overflow-hidden truncate'>{value}</span>
						{onCollapse && (
							<Button
								className={cn(
									"ease transition-transform duration-300",
									collapsed && "rotate-180 transform"
								)}
								size='icon'
								type='button'
								variant='ghost'
								onClick={onCollapse}
							>
								<ChevronDown className='h-5 w-5' />
							</Button>
						)}
					</div>

					{!clone && onRemove && (
						<DropdownMenu>
							<DropdownMenuTrigger
								className={cn({ "opacity-0": ghost && indicator })}
								asChild={true}
							>
								<Button
									aria-label={trans("Menu")}
									size='icon'
									type='button'
									variant='ghost'
								>
									<Ellipsis className='h-5 w-5' />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem onClick={onRemove}>{trans("Delete")}</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
			</li>
		);
	}
);

export default TreeNode;
