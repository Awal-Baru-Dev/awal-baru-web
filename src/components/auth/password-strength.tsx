import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
	calculatePasswordStrength,
	checkPasswordRequirements,
} from "@/lib/validations/auth";

interface PasswordStrengthProps {
	password: string;
	showRequirements?: boolean;
}

/**
 * Password strength indicator with optional requirements checklist
 */
export function PasswordStrength({ password, showRequirements = true }: PasswordStrengthProps) {
	const strength = calculatePasswordStrength(password);
	const requirements = checkPasswordRequirements(password);

	if (!password) return null;

	return (
		<div className="space-y-3 mt-2">
			{/* Strength bar */}
			<div className="space-y-1">
				<div className="flex items-center justify-between text-xs">
					<span className="text-muted-foreground">Kekuatan password</span>
					<span className={cn(
						"font-medium",
						strength.score === 1 && "text-red-500",
						strength.score === 2 && "text-orange-500",
						strength.score === 3 && "text-yellow-600",
						strength.score === 4 && "text-green-500"
					)}>
						{strength.label}
					</span>
				</div>
				<div className="flex gap-1">
					{[1, 2, 3, 4].map((level) => (
						<div
							key={level}
							className={cn(
								"h-1.5 flex-1 rounded-full transition-colors",
								level <= strength.score ? strength.color : "bg-muted"
							)}
						/>
					))}
				</div>
			</div>

			{/* Requirements checklist */}
			{showRequirements && (
				<ul className="space-y-1 text-xs">
					{requirements.map((req) => (
						<li
							key={req.key}
							className={cn(
								"flex items-center gap-2 transition-colors",
								req.met ? "text-green-600" : "text-muted-foreground"
							)}
						>
							{req.met ? (
								<Check className="h-3.5 w-3.5" />
							) : (
								<X className="h-3.5 w-3.5" />
							)}
							{req.label}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
