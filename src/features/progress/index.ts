/**
 * Progress Feature Module
 *
 * Exports for course progress tracking (MVP: position-based)
 */

export {
	getCourseProgress,
	updateCourseProgress,
	calculateProgressPercent,
	calculateLessonPosition,
} from "./actions";

export {
	useCourseProgress,
	useUpdateProgress,
	getProgressDisplayData,
	isLessonCompleted,
	type ProgressDisplayData,
} from "./hooks";
