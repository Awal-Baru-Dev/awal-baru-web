import { useState, forwardRef, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
	error?: boolean;
}

/**
 * Password input with show/hide toggle
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
	({ className, error, ...props }, ref) => {
		const [showPassword, setShowPassword] = useState(false);

		return (
			<div className="relative">
				<Input
					ref={ref}
					type={showPassword ? "text" : "password"}
					className={cn(
						"pr-10",
						error && "border-destructive focus-visible:ring-destructive",
						className
					)}
					{...props}
				/>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
					onClick={() => setShowPassword(!showPassword)}
					tabIndex={-1}
					aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
				>
					{showPassword ? (
						<EyeOff className="h-4 w-4 text-muted-foreground" />
					) : (
						<Eye className="h-4 w-4 text-muted-foreground" />
					)}
				</Button>
			</div>
		);
	}
);

PasswordInput.displayName = "PasswordInput";
