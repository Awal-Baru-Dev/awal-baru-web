/**
 * Progress Feature Module
 *
 * Exports for course progress tracking (MVP: position-based)
 */

export {
	calculateLessonPosition,
	calculateProgressPercent,
	getActivityStreak,
	getAllCourseProgress,
	getCourseProgress,
	getWeeklyActivity,
	logActivity,
	updateCourseProgress,
} from "./actions";

export {
	formatWeeklyChartData,
	getProgressDisplayData,
	isLessonCompleted,
	type ProgressDisplayData,
	useActivityStreak,
	useAllCourseProgress,
	useCourseProgress,
	useLogActivity,
	useUpdateProgress,
	useWeeklyActivity,
	type WeeklyChartData,
} from "./hooks";
