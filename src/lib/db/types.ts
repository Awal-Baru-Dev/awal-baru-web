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
 * Lesson progress data structure
 */
export interface LessonProgress {
	id: string;
	user_id: string;
	course_id: string;
	section_id: string;
	lesson_index: number;
	percent_watched: number;
	seconds_watched: number;
	last_position: number;
	video_duration: number;
	is_completed: boolean;
	completed_at: string | null;
	created_at: string;
	updated_at: string;
}

/**
 * Database tables mapping
 */
export interface Database {
	profiles: Profile;
	courses: Course;
	enrollments: Enrollment;
	notifications: Notification;
	lesson_progress: LessonProgress;
}

export type TableName = keyof Database;
