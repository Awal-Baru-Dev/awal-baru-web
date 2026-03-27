import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-context";

interface ThemeToggleProps {
	className?: string;
	variant?: "default" | "ghost" | "outline";
	size?: "default" | "sm" | "lg" | "icon";
}

export function ThemeToggle({
	className,
	variant = "ghost",
	size = "icon",
}: ThemeToggleProps) {
	const { theme, toggleTheme } = useTheme();

	return (
		<Button
			variant={variant}
			size={size}
			onClick={toggleTheme}
			className={className}
			aria-label={
				theme === "light" ? "Beralih ke mode gelap" : "Beralih ke mode terang"
			}
		>
			{theme === "light" ? (
				<Moon className="h-5 w-5" />
			) : (
				<Sun className="h-5 w-5" />
			)}
		</Button>
	);
}
