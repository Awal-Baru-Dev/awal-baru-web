/**
 * Progress Feature Module
 *
 * Exports for course progress tracking (MVP: position-based)
 */

export {
	getCourseProgress,
	getAllCourseProgress,
	updateCourseProgress,
	calculateProgressPercent,
	calculateLessonPosition,
	logActivity,
	getWeeklyActivity,
	getActivityStreak,
} from "./actions";

export {
	useCourseProgress,
	useAllCourseProgress,
	useUpdateProgress,
	getProgressDisplayData,
	isLessonCompleted,
	useLogActivity,
	useWeeklyActivity,
	useActivityStreak,
	formatWeeklyChartData,
	type ProgressDisplayData,
	type WeeklyChartData,
} from "./hooks";
