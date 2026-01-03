import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { AuthAwareLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
	CourseHero,
	CourseHeroSkeleton,
	// CourseCurriculum,
	// CourseCurriculumSkeleton,
	CourseSidebar,
	CourseSidebarSkeleton,
	CourseMobilePurchaseBar,
	WhatYouLearn,
	WhatYouLearnSkeleton,
} from "@/components/course";
import { PaymentLoadingOverlay } from "@/components/shared";
import { useCourse } from "@/features/courses";
import { useEnrollmentStatus, enrollmentKeys } from "@/features/enrollments";
import { useCreatePayment, useVerifyPayment, getDokuJsUrl } from "@/features/payments";
import { useUser } from "@/contexts/user-context";

const courseSearchSchema = z.object({
	payment: z.enum(["success", "cancelled"]).optional(),
	invoice: z.string().optional(),
});

export const Route = createFileRoute("/courses/$slug")({
	component: CourseDetailPage,
	validateSearch: courseSearchSchema,
});

function CourseDetailPage() {
	const { slug } = Route.useParams();
	const { payment, invoice } = Route.useSearch();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { user, isLoading: isAuthLoading } = useUser();
	const paymentProcessedRef = useRef(false);

	// Fetch course data
	const {
		data: course,
		isLoading: isCourseLoading,
		error: courseError,
	} = useCourse(slug);

	// Check enrollment status
	const { data: enrollment, refetch: refetchEnrollment } = useEnrollmentStatus(
		course?.id ?? "",
	);

	// Payment mutations
	const createPayment = useCreatePayment();
	const verifyPayment = useVerifyPayment();

	const isLoading = isCourseLoading || isAuthLoading;
	const isEnrolled = !!enrollment;

	// Load DOKU checkout script
	useEffect(() => {
		const scriptId = "doku-checkout-script";
		if (document.getElementById(scriptId)) return;

		const script = document.createElement("script");
		script.id = scriptId;
		script.src = getDokuJsUrl();
		script.async = true;
		document.head.appendChild(script);
	}, []);

	// Handle payment success/cancelled redirect
	useEffect(() => {
		if (paymentProcessedRef.current) return;

		if (payment === "success" && invoice) {
			paymentProcessedRef.current = true;

			// Verify payment status
			verifyPayment.mutate(
				{ invoiceNumber: invoice },
				{
					onSuccess: (result) => {
						if (result.success) {
							if (result.status === "paid") {
								toast.success("Pembayaran Berhasil!", {
									description:
										"Selamat! Kursus sudah dapat diakses.",
								});
								// Refetch enrollment status
								refetchEnrollment();
								queryClient.invalidateQueries({
									queryKey: enrollmentKeys.all,
								});
							} else if (result.status === "pending") {
								toast.info("Menunggu Konfirmasi", {
									description:
										"Pembayaran sedang diproses. Mohon tunggu beberapa saat.",
								});
							} else {
								toast.error("Pembayaran Gagal", {
									description: result.message,
								});
							}
						}
					},
				},
			);

			// Clear search params
			navigate({
				to: "/courses/$slug",
				params: { slug },
				search: {},
				replace: true,
			});
		} else if (payment === "cancelled") {
			paymentProcessedRef.current = true;
			toast.info("Pembayaran Dibatalkan", {
				description: "Kamu bisa mencoba lagi kapan saja.",
			});

			// Clear search params
			navigate({
				to: "/courses/$slug",
				params: { slug },
				search: {},
				replace: true,
			});
		}
	}, [
		payment,
		invoice,
		slug,
		navigate,
		verifyPayment,
		refetchEnrollment,
		queryClient,
	]);

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

		if (!course) return;

		// Create payment
		createPayment.mutate(
			{
				isBundle: false,
				courseId: course.id,
				courseSlug: course.slug,
				courseName: course.title,
				coursePrice: course.price,
			},
			{
				onSuccess: (result) => {
					if (!result.success) {
						toast.error("Gagal Memproses Pembayaran", {
							description: result.error || "Silakan coba lagi.",
						});
					}
					// Success case is handled by the hook (opens DOKU modal)
				},
				onError: () => {
					toast.error("Gagal Memproses Pembayaran", {
						description: "Terjadi kesalahan. Silakan coba lagi.",
					});
				},
			},
		);
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
					{/* Breadcrumb skeleton */}
					<nav className="flex items-center gap-2 text-sm mb-4">
						<span className="text-muted-foreground">Katalog Kursus</span>
						<span className="text-muted-foreground/50">/</span>
						<span className="h-4 w-32 bg-muted animate-pulse rounded" />
					</nav>
					<div className="grid lg:grid-cols-3 gap-8">
						{/* Main Content */}
						<div className="lg:col-span-2 space-y-8">
							<CourseHeroSkeleton />
							<WhatYouLearnSkeleton />
							{/* <CourseCurriculumSkeleton /> */}
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
		<>
			<PaymentLoadingOverlay isLoading={createPayment.isPending} />
			<AuthAwareLayout showFooter={false}>
			<div className="container mx-auto max-w-6xl">
				{/* Breadcrumb */}
				<nav className="flex items-center gap-2 text-sm mb-4" aria-label="Breadcrumb">
					<Link
						to="/courses"
						className="text-muted-foreground hover:text-foreground transition-colors"
					>
						Katalog Kursus
					</Link>
					<span className="text-muted-foreground/50">/</span>
					<span className="text-foreground font-medium truncate max-w-[300px]">
						{course?.title ?? "..."}
					</span>
				</nav>

				<div className="grid lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-8">
						<CourseHero course={course} isEnrolled={isEnrolled} />

						{whatYouWillLearn.length > 0 && (
							<WhatYouLearn points={whatYouWillLearn} />
						)}

						{/*
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
						*/}
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
		</>
	);
}

