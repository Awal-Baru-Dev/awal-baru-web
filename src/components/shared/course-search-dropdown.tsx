import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useDebounce } from "use-debounce";
import { Search, Loader2, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearchCourses } from "@/features/courses";
import type { Course } from "@/lib/db/types";
import { cn } from "@/lib/utils";

export function CourseSearchDropdown() {
	const [query, setQuery] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [debouncedQuery] = useDebounce(query, 300);
	const navigate = useNavigate();
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Fetch results based on debounced query
	const { data: results, isLoading } = useSearchCourses(debouncedQuery);

	// Show dropdown when typing and has query
	const showDropdown = isOpen && query.trim().length > 0;

	// Handle click outside to close dropdown
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Handle course selection
	const handleSelectCourse = (course: Course) => {
		setQuery("");
		setIsOpen(false);
		navigate({ to: "/courses/$slug", params: { slug: course.slug } });
	};

	// Handle "Lihat semua" click
	const handleViewAll = () => {
		setIsOpen(false);
		navigate({ to: "/courses", search: { q: query } });
	};

	return (
		<div ref={containerRef} className="relative w-full max-w-md">
			{/* Search input */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
				<Input
					ref={inputRef}
					type="search"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onFocus={() => setIsOpen(true)}
					placeholder="Cari kursus..."
					className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
				/>
			</div>

			{/* Dropdown results */}
			{showDropdown && (
				<div className="absolute top-full mt-2 w-full bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
					{isLoading ? (
						// Loading state
						<div className="p-4 flex items-center justify-center gap-2 text-muted-foreground">
							<Loader2 className="w-4 h-4 animate-spin" />
							<span className="text-sm">Mencari...</span>
						</div>
					) : results && results.length > 0 ? (
						// Results list
						<div>
							{results.slice(0, 5).map((course) => (
								<SearchResultItem
									key={course.id}
									course={course}
									onClick={() => handleSelectCourse(course)}
								/>
							))}
							{results.length > 5 && (
								<button
									type="button"
									onClick={handleViewAll}
									className="w-full p-3 text-sm text-brand-primary hover:bg-accent text-center border-t border-border"
								>
									Lihat semua {results.length} hasil
								</button>
							)}
						</div>
					) : (
						// Empty state
						<div className="p-4 text-center">
							<div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
								<BookOpen className="w-5 h-5 text-muted-foreground" />
							</div>
							<p className="text-sm text-muted-foreground">
								Tidak ada hasil untuk "{query}"
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

interface SearchResultItemProps {
	course: Course;
	onClick: () => void;
}

function SearchResultItem({ course, onClick }: SearchResultItemProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="w-full p-3 flex items-center gap-3 hover:bg-accent text-left transition-colors"
		>
			{/* Thumbnail */}
			<div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
				{course.thumbnail_url ? (
					<img
						src={course.thumbnail_url}
						alt={course.title}
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center">
						<BookOpen className="w-5 h-5 text-muted-foreground" />
					</div>
				)}
			</div>

			{/* Content */}
			<div className="flex-1 min-w-0">
				<p className="font-medium text-foreground truncate">{course.title}</p>
				<p className="text-sm text-muted-foreground truncate">
					{course.category && (
						<span className={cn(
							"inline-block px-1.5 py-0.5 text-xs rounded mr-2",
							course.category === "Bundle"
								? "bg-brand-primary/10 text-brand-primary"
								: "bg-muted"
						)}>
							{course.category}
						</span>
					)}
					Rp {course.price.toLocaleString("id-ID")}
				</p>
			</div>
		</button>
	);
}
