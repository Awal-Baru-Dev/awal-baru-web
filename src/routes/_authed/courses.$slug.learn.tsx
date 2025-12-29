import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourse } from "@/features/courses";
import { useEnrollmentStatus } from "@/features/enrollments";
import { useUser } from "@/contexts/user-context";
import {
	getCourseProgress,
	updateCourseProgress,
} from "@/features/progress/actions";
import { getSignedVideoUrl } from "@/lib/services/video/bunny";

// Search params schema for lesson navigation
const learnSearchSchema = z.object({
	section: z.string().optional(),
	lesson: z.coerce.number().optional(),
});

export const Route = createFileRoute("/_authed/courses/$slug/learn")({
	component: CourseLearnPage,
	validateSearch: learnSearchSchema,
});

/**
 * Course Learn Page (Masterclass Style)
 * Single long-form video player with progress tracking
 */
function CourseLearnPage() {
	const { slug } = Route.useParams();
	const { user } = useUser();

	// Refs
	const videoRef = useRef<HTMLVideoElement>(null);
	const throttledSyncRef = useRef<NodeJS.Timeout | null>(null);

	// State
	const [videoUrl, setVideoUrl] = useState<string | null>(null);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [progress, setProgress] = useState(0);
	const [lastWatchedTime, setLastWatchedTime] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch course data
	const { data: course, isLoading: isCourseLoading } = useCourse(slug);
	const { data: enrollment, isLoading: isEnrollmentLoading } =
		useEnrollmentStatus(course?.id ?? "");

	const isEnrolled = !!enrollment;

	// State ref to maintain current values in async callbacks
	const stateRef = useRef({
		user,
		course,
	});

	useEffect(() => {
		stateRef.current = { user, course };
	}, [user, course]);

	// Progress sync logic with throttling
	const performSync = async (
		seconds: number,
		totalDuration: number,
		isEnding: boolean = false,
	) => {
		const { user: currentUser, course: currentCourse } = stateRef.current;
		if (!currentUser || !currentCourse) return;

		const firstSectionId =
			currentCourse.content?.sections?.[0]?.id || "default-section";

		const percent =
			totalDuration > 0 ? Math.round((seconds / totalDuration) * 100) : 0;

		await updateCourseProgress(
			currentUser.id,
			currentCourse.id,
			firstSectionId,
			0,
			percent,
			Math.floor(seconds),
		);
	};

	const syncProgressToBackend = (seconds: number, totalDuration: number) => {
		if (throttledSyncRef.current) {
			clearTimeout(throttledSyncRef.current);
		}

		throttledSyncRef.current = setTimeout(() => {
			performSync(seconds, totalDuration);
		}, 30000); // throttle to 30 seconds
	};

	// Fetch last watched time from database
	useEffect(() => {
		const fetchResume = async () => {
			if (!course || !user) return;

			const result = await getCourseProgress(user.id, course.id);
			if (result.data?.last_watched_seconds) {
				setLastWatchedTime(result.data.last_watched_seconds);
			}

			setIsLoading(false);
		};

		if (course && isEnrolled) {
			fetchResume();
		}
	}, [course, isEnrolled, user]);

	// Fetch signed video URL from Bunny.net
	useEffect(() => {
		const loadVideo = async () => {
			if (!course) return;

			const videoId = course.content?.sections?.[0]?.lessons?.[0]?.videoId;

			if (!videoId) return;

			try {
				const signedUrl = await getSignedVideoUrl(videoId, "mp4");
				setVideoUrl(signedUrl);
			} catch (err) {
				console.error("❌ Failed to load signed video URL", err);
			}
		};

		loadVideo();
	}, [course]);

	// Video event handlers
	const handleLoadedMetadata = () => {
		const video = videoRef.current;
		if (!video) return;

		setDuration(video.duration);

		if (lastWatchedTime && lastWatchedTime > 0) {
			video.currentTime = lastWatchedTime;
		}
	};

	const handleTimeUpdate = () => {
		const video = videoRef.current;
		if (!video || !video.duration) return;

		const current = video.currentTime;
		const total = video.duration;

		setCurrentTime(current);
		setProgress((current / total) * 100);

		syncProgressToBackend(current, total);
	};

	const handleEnded = () => {
		if (!videoRef.current) return;
		performSync(videoRef.current.duration, videoRef.current.duration, true);
	};

	// Not enrolled - redirect to course detail page
	if (!isCourseLoading && !isEnrollmentLoading && course && !isEnrolled) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center max-w-md mx-auto px-6">
					<AlertCircle className="w-10 h-10 mx-auto mb-4 text-destructive" />
					<h1 className="text-xl font-bold mb-2">Akses Ditolak</h1>
					<p className="text-muted-foreground mb-6">
						Kamu belum terdaftar di kursus ini.
					</p>
					<Button asChild>
						<Link to="/courses/$slug" params={{ slug }}>
							Lihat Detail Kursus
						</Link>
					</Button>
				</div>
			</div>
		);
	}

	// Loading state
	if (isCourseLoading || isEnrollmentLoading || isLoading || !videoUrl) {
		return (
			<div className="min-h-screen bg-background p-6">
				<Skeleton className="aspect-video w-full rounded-xl mb-4" />
				<Skeleton className="h-4 w-32" />
			</div>
		);
	}

	// Main render
	return (
		<div className="min-h-screen bg-background">
			<header className="fixed top-0 left-0 right-0 z-50 bg-background/95 border-b">
				<div className="flex items-center h-14 px-4">
					<Button variant="ghost" size="sm" asChild>
						<Link to="/dashboard">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Kembali
						</Link>
					</Button>
					<h1 className="ml-4 text-sm font-medium">{course?.title}</h1>
				</div>
			</header>

			<div className="pt-16 max-w-5xl mx-auto p-4">
				<div className="aspect-video bg-black rounded-xl overflow-hidden mb-4">
					<video
						ref={videoRef}
						src={videoUrl}
						controls
						playsInline
						className="w-full h-full"
						onLoadedMetadata={handleLoadedMetadata}
						onTimeUpdate={handleTimeUpdate}
						onEnded={handleEnded}
						onPause={() => performSync(currentTime, duration)}
					/>
				</div>

				{/* Progress bar */}
				<div>
					<div className="h-2 w-full bg-muted rounded-full">
						<div
							className="h-2 bg-brand-primary rounded-full"
							style={{ width: `${progress}%` }}
						/>
					</div>

					<div className="flex justify-between text-xs text-muted-foreground mt-1">
						<span>
							{new Date(currentTime * 1000).toISOString().slice(14, 19)}
						</span>
						<span>{new Date(duration * 1000).toISOString().slice(14, 19)}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
