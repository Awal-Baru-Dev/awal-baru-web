/**
 * Database abstraction types
 *
 * These types define the interface for database operations.
 * Implementations (Supabase, REST API, etc.) must conform to these interfaces.
 */

import type { User } from "@supabase/supabase-js";

// Re-export User type for convenience
export type { User };

/**
 * Authentication result
 */
export interface AuthResult {
	success: boolean;
	user?: User | null;
	error?: string;
}

/**
 * Generic query result
 */
export interface QueryResult<T> {
	data: T | null;
	error: string | null;
}

/**
 * Generic list query result
 */
export interface ListResult<T> {
	data: T[];
	error: string | null;
	count?: number;
}

/**
 * Profile data structure
 */
export interface Profile {
	id: string;
	full_name: string | null;
	avatar_url: string | null;
	phone: string | null;
	created_at: string;
	updated_at: string;
}

/**
 * Course content section
 */
export interface CourseSection {
	id: string;
	title: string;
	lessons: CourseLesson[];
}

/**
 * Course lesson within a section
 */
export interface CourseLesson {
	title: string;
	duration?: string;
	videoId?: string;
	isFree?: boolean;
	/** Start time in seconds for chapter-based navigation within a single video */
	startTime?: number;
}

/**
 * Course content JSONB structure
 */
export interface CourseContent {
	sections?: CourseSection[];
}

/**
 * Course metadata JSONB structure
 */
export interface CourseMetadata {
	whatYouWillLearn?: string[];
	features?: string[];
	tags?: string[];
	stats?: {
		students: number;
		rating: number;
		reviews: number;
	};
	requirements?: string[];
	targetAudience?: string[];
}

/**
 * Course data structure
 */
export interface Course {
	id: string;
	slug: string;
	title: string;
	short_description: string | null;
	price: number;
	original_price: number | null;
	thumbnail_url: string | null;
	preview_video_url: string | null;
	instructor_name: string | null;
	instructor_title: string | null;
	instructor_avatar: string | null;
	level: string | null;
	category: string | null;
	duration_minutes: number;
	lessons_count: number;
	video_id: string | null;
	is_published: boolean;
	is_featured: boolean;
	display_order: number;
	content: CourseContent;
	metadata: CourseMetadata;
	created_at: string;
	updated_at: string;
}

/**
 * Payment status enum
 */
export type PaymentStatus =
	| "pending"
	| "paid"
	| "failed"
	| "refunded"
	| "expired";

/**
 * Payment method enum
 */
export type PaymentMethod =
	| "virtual_account"
	| "credit_card"
	| "e_wallet"
	| "qris"
	| "retail"
	| "direct_debit"
	| "paylater";

/**
 * Enrollment data structure
 */
export interface Enrollment {
	id: string;
	user_id: string;
	course_id: string;
	payment_status: PaymentStatus;
	payment_method: PaymentMethod | null;
	payment_reference: string | null;
	payment_channel: string | null;
	amount_paid: number;
	purchased_at: string | null;
	expires_at: string | null;
	created_at: string;
	updated_at: string;
}

/**
 * Enrollment with course details
 */
export interface EnrollmentWithCourse extends Enrollment {
	course: Course;
}

/**
 * Notification type enum
 */
export type NotificationType =
	| "course"
	| "achievement"
	| "community"
	| "system"
	| "payment";

/**
 * Notification data structure
 */
export interface Notification {
	id: string;
	user_id: string;
	type: NotificationType;
	title: string;
	message: string;
	link: string | null;
	is_read: boolean;
	metadata: Record<string, unknown>;
	created_at: string;
}

/**
 * Course progress data structure (MVP: position-based tracking)
 *
 * Tracks the user's current position in a course.
 * Progress = current_lesson_position / total_lessons
 *
 * See docs/PROGRESS_TRACKING.md for detailed documentation.
 */
export interface CourseProgress {
	id: string;
	user_id: string;
	course_id: string;
	/** Current section ID (maps to content.sections[].id) */
	current_section_id: string;
	/** 0-based lesson index within the section */
	current_lesson_index: number;
	/** Overall progress 0-100, derived from position */
	progress_percent: number;
	last_accessed_at: string;
	last_watched_seconds?: number;
	created_at: string;
	updated_at: string;
}

/**
 * Activity log data structure
 *
 * Tracks daily user activity for dashboard stats (weekly charts, streak).
 * One record per user per course per day.
 */
export interface ActivityLog {
	id: string;
	user_id: string;
	course_id: string;
	/** Date of activity (YYYY-MM-DD format) */
	activity_date: string;
	/** Number of lessons completed on this day */
	lessons_completed: number;
	/** Total time spent watching videos on this day (minutes) */
	time_spent_minutes: number;
	created_at: string;
	updated_at: string;
}

/**
 * Aggregated weekly activity (for dashboard)
 */
export interface WeeklyActivity {
	day: string;
	lessons: number;
	minutes: number;
}

/**
 * Database tables mapping
 */
export interface Database {
	profiles: Profile;
	courses: Course;
	enrollments: Enrollment;
	notifications: Notification;
	course_progress: CourseProgress;
	activity_log: ActivityLog;
}

export type TableName = keyof Database;
