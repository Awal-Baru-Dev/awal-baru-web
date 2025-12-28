import { CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface WhatYouLearnProps {
	points: string[];
	className?: string;
}

/**
 * What You'll Learn Component
 *
 * Displays a grid of learning points with checkmarks.
 */
export function WhatYouLearn({ points, className }: WhatYouLearnProps) {
	if (points.length === 0) {
		return null;
	}

	return (
		<div className={cn("space-y-4", className)}>
			<h2 className="text-xl font-semibold text-foreground">
				Yang Akan Kamu Pelajari
			</h2>

			<div className="grid sm:grid-cols-2 gap-3">
				{points.map((point, index) => (
					<div
						key={`learn-${index}`}
						className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
					>
						<CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
						<span className="text-sm text-foreground">{point}</span>
					</div>
				))}
			</div>
		</div>
	);
}

/**
 * Skeleton loading state for WhatYouLearn
 */
export function WhatYouLearnSkeleton() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-6 w-48" />

			<div className="grid sm:grid-cols-2 gap-3">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
						<Skeleton className="w-5 h-5 rounded-full flex-shrink-0" />
						<Skeleton className="h-4 flex-1" />
					</div>
				))}
			</div>
		</div>
	);
}
