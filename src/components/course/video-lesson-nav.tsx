import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LessonNavInfo {
	sectionId: string;
	lessonIndex: number;
	title: string;
}

interface VideoLessonNavProps {
	previousLesson: LessonNavInfo | null;
	nextLesson: LessonNavInfo | null;
	onNavigate: (sectionId: string, lessonIndex: number) => void;
}

/**
 * Video Lesson Navigation Component
 *
 * Displays Previous/Next buttons for navigating between lessons.
 * Buttons are disabled when at the boundary (first/last lesson).
 */
export function VideoLessonNav({
	previousLesson,
	nextLesson,
	onNavigate,
}: VideoLessonNavProps) {
	return (
		<div className="flex items-center justify-between gap-4">
			<Button
				variant="outline"
				onClick={() =>
					previousLesson &&
					onNavigate(previousLesson.sectionId, previousLesson.lessonIndex)
				}
				disabled={!previousLesson}
				className="flex-1 sm:flex-none"
			>
				<ChevronLeft className="w-4 h-4 mr-2" />
				<span className="hidden sm:inline">Sebelumnya</span>
				<span className="sm:hidden">Prev</span>
			</Button>

			<Button
				onClick={() =>
					nextLesson &&
					onNavigate(nextLesson.sectionId, nextLesson.lessonIndex)
				}
				disabled={!nextLesson}
				className="flex-1 sm:flex-none"
			>
				<span className="hidden sm:inline">Selanjutnya</span>
				<span className="sm:hidden">Next</span>
				<ChevronRight className="w-4 h-4 ml-2" />
			</Button>
		</div>
	);
}

export type { LessonNavInfo };
