import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { AlertCircle, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourse } from "@/features/courses";
import { useEnrollmentStatus } from "@/features/enrollments";
import { useUser } from "@/contexts/user-context";
import {
	getCourseProgress,
	updateCourseProgress,
	logActivity,
} from "@/features/progress/actions";
import { getSignedVideoUrl } from "@/lib/services/video/bunny";
import { CourseLearnSidebar } from "@/components/course";

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
 * Format duration helper
 */
function formatDuration(minutes: number): string {
	if (!minutes) return "-";
	if (minutes < 60) return `${minutes} menit`;
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	return remainingMinutes === 0
		? `${hours} jam`
		: `${hours} jam ${remainingMinutes} menit`;
}

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

	const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

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
	const lastSyncTimeRef = useRef<number>(Date.now());

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

		const currentTime = Date.now();
    const timeDiffInMs = currentTime - lastSyncTimeRef.current;

    if (timeDiffInMs > 7200000) {
      lastSyncTimeRef.current = currentTime;
      return;
    }

    if (timeDiffInMs >= 30000 || isEnding) {
      const minutesToAdd = Math.ceil(timeDiffInMs / 60000);

      await logActivity(
        currentUser.id,
        currentCourse.id,
        isEnding ? 1 : 0,
        minutesToAdd
      );

      lastSyncTimeRef.current = currentTime;
    }
	};

	const syncProgressToBackend = (seconds: number, totalDuration: number) => {
		if (throttledSyncRef.current) {
			clearTimeout(throttledSyncRef.current);
		}

		throttledSyncRef.current = setTimeout(() => {
			performSync(seconds, totalDuration);
		}, 30000); // throttle to 30 seconds
	};

	// Handle back to dashboard (update progress first)
	const handleBackToDashboard = async () => {
    setIsLoading(true);

    try {
      let exactTime = currentTime;
      if (videoRef.current) {
        videoRef.current.pause();
        exactTime = videoRef.current.currentTime;
      }

      await performSync(exactTime, duration);
      await queryClient.invalidateQueries();

      navigate({ to: "/dashboard" });
    } catch (error) {
      console.error("Gagal sinkronisasi saat kembali:", error);
      setIsLoading(false);
    }
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
		setShowCompleteDialog(true);
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Updated: Button di kiri, Title di tengah */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-background/95 border-b backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container relative mx-auto max-w-7xl flex items-center justify-center h-16 px-4 lg:px-8">
          {/* Button Kembali (Absolute Left) */}
          <div className="absolute left-4 lg:left-8">
            <Button variant="ghost" size="sm" onClick={handleBackToDashboard}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Kembali</span>
            </Button>
          </div>

          {/* Title (Centered) */}
          <h1 className="text-sm font-semibold truncate max-w-[60%] mx-auto text-center">
            {course?.title}
          </h1>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 py-8 px-4 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          {/* GRID LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Video Player */}
              <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-border/50 ring-1 ring-border/10">
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

              {/* Judul & Deskripsi */}
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                  {course?.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="font-semibold">
                    Video Course
                  </Badge>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(course?.duration_minutes || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border" />

              <div className="prose prose-sm lg:prose-base dark:prose-invert max-w-none text-muted-foreground">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Tentang Materi Ini
                </h3>
                {course?.short_description ? (
                  <p>{course.short_description}</p>
                ) : (
                  <p>
                    {course?.short_description ||
                      "Tonton video materi ini sampai selesai untuk mendapatkan pemahaman penuh."}
                  </p>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <CourseLearnSidebar course={course} progress={progress} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <AlertDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Selamat!</AlertDialogTitle>
            <AlertDialogDescription>
              Kamu telah menyelesaikan materi <b>{course?.title}</b>. Progress
              kamu telah disimpan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleBackToDashboard}>
              Kembali ke Dashboard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
