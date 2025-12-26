import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
	id: string;
	label: string;
	error?: string;
	children: ReactNode;
	className?: string;
	labelAction?: ReactNode;
}

/**
 * Form field wrapper with label and error message
 */
export function FormField({
	id,
	label,
	error,
	children,
	className,
	labelAction,
}: FormFieldProps) {
	return (
		<div className={cn("space-y-2", className)}>
			<div className="flex justify-between items-center">
				<Label htmlFor={id} className={cn(error && "text-destructive")}>
					{label}
				</Label>
				{labelAction}
			</div>
			{children}
			{error && (
				<p className="text-xs text-destructive" role="alert" aria-live="polite">
					{error}
				</p>
			)}
		</div>
	);
}
