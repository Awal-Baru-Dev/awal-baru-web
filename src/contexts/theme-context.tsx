import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = "awalbaru-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<Theme>("light");
	const [mounted, setMounted] = useState(false);

	// Initialize theme from localStorage or default to light
	useEffect(() => {
		setMounted(true);

		// Check localStorage first
		const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;

		if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
			setThemeState(savedTheme);
		}
		// Default to light mode (as requested)
		// If you want to respect system preference, uncomment below:
		// else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
		//   setThemeState('dark')
		// }
	}, []);

	// Apply theme class to document
	useEffect(() => {
		if (!mounted) return;

		const root = document.documentElement;

		if (theme === "dark") {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}

		// Save to localStorage
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	}, [theme, mounted]);

	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme);
	};

	const toggleTheme = () => {
		setThemeState((prev) => (prev === "light" ? "dark" : "light"));
	};

	// Prevent hydration mismatch by not rendering until mounted
	// This ensures server and client render the same initial state
	const value: ThemeContextValue = {
		theme,
		setTheme,
		toggleTheme,
	};

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);

	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}

	return context;
}

// Script to inject before hydration to prevent flash
// Add this to your HTML head for best results
export const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('${THEME_STORAGE_KEY}');
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  })();
`;
