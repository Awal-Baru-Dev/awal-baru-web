/**
 * Application constants for AwalBaru.com
 */

export const APP_NAME = "AwalBaru.com";
export const APP_DESCRIPTION =
	"Platform pembelajaran online untuk membantu orang Indonesia meraih American Dream";
export const APP_TAGLINE = "Wujudkan Impian Amerikamu";

/**
 * Brand information
 */
export const BRAND = {
	name: "AwalBaru.com",
	shortName: "AB",
	founder: "Tedchay",
	founderTitle: "DV Lottery Winner & Content Creator",
	youtube: "https://www.youtube.com/@tedchay",
} as const;

/**
 * Bundle pricing configuration
 */
export const BUNDLE_CONFIG = {
	name: "Paket Semua Kursus",
	price: 499000,
	originalPrice: 999000,
	description: "Akses semua kursus premium dengan satu pembelian.",
	features: [
		"Akses 12 bulan ke semua kursus",
		"Total 40+ jam konten video",
		"Update materi gratis",
		"Akses komunitas eksklusif",
	],
} as const;

/**
 * Navigation links
 */
export const NAV_LINKS = {
	public: [
		{ href: "/", label: "Beranda" },
		{ href: "/tentang", label: "Tentang" },
		{ href: "/harga", label: "Harga" },
	],
	dashboard: [
		{ href: "/courses", label: "Kursus", icon: "BookOpen" },
		{ href: "/courses/my-courses", label: "Kursus Saya", icon: "GraduationCap" },
		{ href: "/courses/community", label: "Komunitas", icon: "Users" },
		{ href: "/courses/support", label: "Bantuan", icon: "HelpCircle" },
	],
} as const;

/**
 * Social links
 */
export const SOCIAL_LINKS = {
	youtube: "https://www.youtube.com/@tedchay",
	instagram: "https://instagram.com/awalbaru.com",
	facebook: "https://facebook.com/awalbaru.com",
	whatsapp: "https://wa.me/1234567890",
} as const;

/**
 * Payment configuration
 */
export const PAYMENT = {
	currency: "IDR",
	currencySymbol: "Rp",
	// DOKU payment expiry in minutes
	expiryMinutes: 60,
} as const;

/**
 * Lesson progress configuration
 */
export const PROGRESS = {
	// Percentage threshold to mark a lesson as complete (90%)
	completionThreshold: 0.9,
	// How often to save progress during video playback (in seconds)
	saveIntervalSeconds: 10,
} as const;

/**
 * Supported course levels
 */
export const COURSE_LEVELS = ["Pemula", "Menengah", "Mahir"] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = [
	"course",
	"achievement",
	"community",
	"system",
	"payment",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
