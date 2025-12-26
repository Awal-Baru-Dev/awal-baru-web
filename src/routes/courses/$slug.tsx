import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AuthAwareLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
	CourseHero,
	CourseHeroSkeleton,
	CourseCurriculum,
	CourseCurriculumSkeleton,
	CourseSidebar,
	CourseSidebarSkeleton,
	CourseMobilePurchaseBar,
	WhatYouLearn,
	WhatYouLearnSkeleton,
} from "@/components/course";
import { useCourse } from "@/features/courses";
import { useEnrollmentStatus } from "@/features/enrollments";
import { useUser } from "@/contexts/user-context";

export const Route = createFileRoute("/courses/$slug")({
	component: CourseDetailPage,
});

function CourseDetailPage() {
	const { slug } = Route.useParams();
	const navigate = useNavigate();
	const { user, isLoading: isAuthLoading, isAuthenticated } = useUser();

	// Fetch course data
	const {
		data: course,
		isLoading: isCourseLoading,
		error: courseError,
	} = useCourse(slug);

	// Check enrollment status
	const { data: enrollment } = useEnrollmentStatus(course?.id ?? "");

	const isLoading = isCourseLoading || isAuthLoading;
	const isEnrolled = !!enrollment;

	// Handle purchase
	const handlePurchase = () => {
		if (!user) {
			// Redirect to login with return URL
			navigate({
				to: "/masuk",
				search: { redirect: `/courses/${slug}` },
			});
			return;
		}

		// TODO: Implement payment flow
		console.log("Purchase course:", course?.id);
	};

	// Error state
	if (courseError) {
		return (
			<AuthAwareLayout showFooter={false}>
				<div className="container mx-auto max-w-6xl">
					<div className="text-center py-20">
						<div className="w-20 h-20 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
							<span className="text-4xl">🔍</span>
						</div>
						<h1 className="text-2xl font-bold text-foreground mb-4">
							Kursus Tidak Ditemukan
						</h1>
						<p className="text-muted-foreground max-w-md mx-auto mb-6">
							Kursus yang kamu cari tidak tersedia atau telah dihapus.
						</p>
						<Button asChild>
							<Link to="/courses">Lihat Semua Kursus</Link>
						</Button>
					</div>
				</div>
			</AuthAwareLayout>
		);
	}

	// Loading state
	if (isLoading || !course) {
		return (
			<AuthAwareLayout showFooter={false}>
				<div className="container mx-auto max-w-6xl">
					<div className="grid lg:grid-cols-3 gap-8">
						{/* Main Content */}
						<div className="lg:col-span-2 space-y-8">
							<CourseHeroSkeleton />
							<WhatYouLearnSkeleton />
							<CourseCurriculumSkeleton />
						</div>

						{/* Sidebar */}
						<div className="hidden lg:block">
							<div className="sticky top-24">
								<CourseSidebarSkeleton />
							</div>
						</div>
					</div>
				</div>
			</AuthAwareLayout>
		);
	}

	const whatYouWillLearn = course.metadata?.whatYouWillLearn || [];

	return (
		<AuthAwareLayout showFooter={false}>
			<div className="container mx-auto max-w-6xl">
				{/* Back button - only show when not authenticated (no sidebar navigation) */}
				{!isAuthenticated && (
					<Button variant="ghost" size="sm" asChild className="mb-4">
						<Link to="/courses">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Kembali
						</Link>
					</Button>
				)}

				<div className="grid lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-8">
						<CourseHero course={course} />

						{whatYouWillLearn.length > 0 && (
							<WhatYouLearn points={whatYouWillLearn} />
						)}

						<CourseCurriculum
							course={course}
							isEnrolled={isEnrolled}
							onLessonClick={(sectionId, lessonIndex) => {
								// Handle lesson click for free previews or enrolled users
								if (isEnrolled) {
									navigate({
										to: "/courses/$slug/learn",
										params: { slug },
										search: { section: sectionId, lesson: lessonIndex },
									});
								}
							}}
						/>
					</div>

					{/* Sidebar - Desktop */}
					<div className="hidden lg:block">
						<div className="sticky top-24">
							<CourseSidebar
								course={course}
								isEnrolled={isEnrolled}
								onPurchase={handlePurchase}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile Purchase Bar */}
			<CourseMobilePurchaseBar
				course={course}
				isEnrolled={isEnrolled}
				onPurchase={handlePurchase}
			/>
		</AuthAwareLayout>
	);
}

