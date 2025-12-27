import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Clock, Users, Gift, Award } from "lucide-react";
import { z } from "zod";
import { AuthAwareLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	CourseGrid,
	CourseGridLoading,
	CourseGridError,
} from "@/components/course";
import { PaymentLoadingOverlay } from "@/components/shared";
import { useCourses, useFeaturedCourses, useSearchCourses } from "@/features/courses";
import { useEnrolledCourseIds, enrollmentKeys } from "@/features/enrollments";
import { useCreatePayment, useVerifyPayment, getDokuJsUrl } from "@/features/payments";
import { useUser } from "@/contexts/user-context";

// Search params validation schema
const searchParamsSchema = z.object({
	q: z.string().max(100).optional(),
	payment: z.enum(["success", "cancelled"]).optional(),
	type: z.enum(["bundle"]).optional(),
	invoice: z.string().optional(),
});

type CoursesSearchParams = z.infer<typeof searchParamsSchema>;

export const Route = createFileRoute("/courses/")({
	validateSearch: (search: Record<string, unknown>): CoursesSearchParams => {
		const result = searchParamsSchema.safeParse(search);
		if (result.success) {
			return result.data;
		}
		// Return empty params on validation failure
		return {};
	},
	component: CoursesPage,
});

function CoursesPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { user, isAuthenticated } = useUser();
	const { q: searchQuery, payment, type, invoice } = Route.useSearch();
	const paymentProcessedRef = useRef(false);

	// Determine if we're in search mode
	const hasSearchQuery = !!searchQuery?.trim();

	// Fetch all courses or search results based on query
	// Only fetch all courses when NOT searching to avoid race condition
	const { data: allCourses, isLoading: isLoadingAll, error: allError, refetch: refetchAll } = useCourses({ enabled: !hasSearchQuery });
	const { data: searchResults, isLoading: isSearching, error: searchError } = useSearchCourses(searchQuery || "");
	const { data: featuredCourses } = useFeaturedCourses();
	const courses = hasSearchQuery ? searchResults : allCourses;
	const isLoading = hasSearchQuery ? isSearching : isLoadingAll;
	const error = hasSearchQuery ? searchError : allError;
	const refetch = refetchAll;

	// Get enrolled course IDs
	const { data: enrolledCourseIds, refetch: refetchEnrollments } = useEnrolledCourseIds();

	// Payment mutations
	const createPayment = useCreatePayment();
	const verifyPayment = useVerifyPayment();

	// Separate bundle from regular courses
	const bundle = courses?.find((c) => c.category === "Bundle");
	const regularCourses = courses?.filter((c) => c.category !== "Bundle");

	// Calculate dynamic values for bundle
	const courseCount = regularCourses?.length || 0;
	const totalNormalPrice =
		regularCourses?.reduce((sum, c) => sum + c.price, 0) || 0;

	// Check if user owns all courses
	const ownsAllCourses =
		enrolledCourseIds &&
		regularCourses &&
		regularCourses.length > 0 &&
		regularCourses.every((c) => enrolledCourseIds.has(c.id));

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

	// Handle bundle payment success/cancelled redirect
	useEffect(() => {
		if (paymentProcessedRef.current) return;

		if (payment === "success" && type === "bundle" && invoice) {
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
										"Selamat! Semua kursus sudah dapat diakses.",
								});
								refetchEnrollments();
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
				to: "/courses",
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
				to: "/courses",
				search: {},
				replace: true,
			});
		}
	}, [
		payment,
		type,
		invoice,
		navigate,
		verifyPayment,
		refetchEnrollments,
		queryClient,
	]);

	// Handle bundle purchase
	const handleBundlePurchase = () => {
		if (!user) {
			navigate({
				to: "/masuk",
				search: { redirect: "/courses" },
			});
			return;
		}

		createPayment.mutate(
			{ isBundle: true },
			{
				onSuccess: (result) => {
					if (!result.success) {
						toast.error("Gagal Memproses Pembayaran", {
							description: result.error || "Silakan coba lagi.",
						});
					}
				},
				onError: () => {
					toast.error("Gagal Memproses Pembayaran", {
						description: "Terjadi kesalahan. Silakan coba lagi.",
					});
				},
			},
		);
	};

	// Get hero course: bundle takes priority, otherwise first featured course
	const heroCourse = bundle || featuredCourses?.[0];
	const isBundle = heroCourse?.category === "Bundle";

	// Calculate discount percentage for bundle
	const discountPercentage =
		isBundle && heroCourse?.original_price
			? Math.round(
					((heroCourse.original_price - heroCourse.price) /
						heroCourse.original_price) *
						100,
				)
			: 0;

	// Hero section to pass to AuthAwareLayout
	const heroSection = (
		<section className="bg-hero-gradient text-white">
			<div className="container mx-auto max-w-6xl px-6 py-16 lg:py-20">
				{heroCourse ? (
					<div className="grid lg:grid-cols-2 gap-10 items-center">
						{/* Left: Text Content */}
						<div className="space-y-6">
							{/* Badges */}
							<div className="flex items-center gap-3">
								{isBundle ? (
									<>
										<Badge className="bg-white/20 text-white border-0 hover:bg-white/30 flex items-center gap-1.5">
											<Gift className="w-3.5 h-3.5" />
											PAKET HEMAT
										</Badge>
										{discountPercentage > 0 && (
											<Badge className="bg-red-500 text-white border-0">
												-{discountPercentage}%
											</Badge>
										)}
									</>
								) : (
									<Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
										PAKET KURSUS
									</Badge>
								)}
							</div>

							<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
								{heroCourse.title}
							</h1>

							{heroCourse.short_description && (
								<p className="text-lg text-white/90 leading-relaxed">
									{heroCourse.short_description}
								</p>
							)}

							{/* Features list - show dynamic count for bundle */}
							<ul className={isBundle ? "grid grid-cols-2 gap-3" : "space-y-3"}>
								{isBundle ? (
									<>
										<li className="flex items-center gap-3">
											<CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0" />
											<span className="text-white/90">
												Akses ke semua {courseCount} kursus
											</span>
										</li>
										{heroCourse.metadata?.features
											?.slice(1, 4)
											.map((feature, index) => (
												<li
													key={`feature-${index}`}
													className="flex items-center gap-3"
												>
													<CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0" />
													<span className="text-white/90">{feature}</span>
												</li>
											))}
									</>
								) : (
									heroCourse.metadata?.features
										?.slice(0, 4)
										.map((feature, index) => (
											<li
												key={`feature-${index}`}
												className="flex items-center gap-3"
											>
												<CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0" />
												<span className="text-white/90">{feature}</span>
											</li>
										))
								)}
							</ul>

							{/* Stats - different for bundle vs regular course */}
							{!isBundle && (
								<div className="flex items-center gap-6 text-sm text-white/80">
									<div className="flex items-center gap-2">
										<Clock className="w-4 h-4" />
										<span>
											{Math.floor(heroCourse.duration_minutes / 60)} jam
											pelajaran
										</span>
									</div>
									<div className="flex items-center gap-2">
										<Users className="w-4 h-4" />
										<span>
											{heroCourse.metadata?.stats?.students || 0}+ siswa
										</span>
									</div>
								</div>
							)}

							{/* CTA */}
							<div className="space-y-3">
								<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
									{/* Show different CTA based on ownership */}
									{isBundle && ownsAllCourses ? (
										<Badge className="bg-green-600 text-white border-0 text-base px-6 py-2">
											<Award className="w-5 h-5 mr-2" />
											Semua Kursus Sudah Dimiliki
										</Badge>
									) : isBundle ? (
										<Button
											size="lg"
											className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8"
											onClick={handleBundlePurchase}
											disabled={createPayment.isPending}
										>
											<Gift className="w-4 h-4 mr-2" />
											{createPayment.isPending
												? "Memproses..."
												: "Beli Paket Lengkap"}
										</Button>
									) : (
										<Button
											size="lg"
											className="bg-white text-brand-primary hover:bg-white/90 font-semibold px-8"
											asChild
										>
											<Link
												to="/courses/$slug"
												params={{ slug: heroCourse.slug }}
											>
												Lihat Detail
												<ArrowRight className="w-4 h-4 ml-2" />
											</Link>
										</Button>
									)}
									{/* Price - hide when user owns all courses */}
									{!(isBundle && ownsAllCourses) && (
									<div className="text-lg">
										<span className="font-bold text-2xl">
											Rp {heroCourse.price.toLocaleString("id-ID")}
										</span>
										{heroCourse.original_price &&
											heroCourse.original_price > heroCourse.price && (
												<span className="ml-2 text-white/60 line-through">
													Rp{" "}
													{heroCourse.original_price.toLocaleString("id-ID")}
												</span>
											)}
									</div>
									)}
								</div>

								{/* Show normal price note for bundle - hide when user owns all */}
								{isBundle && totalNormalPrice > 0 && !ownsAllCourses && (
									<p className="text-sm text-white/60">
										* Harga normal jika beli satuan: Rp{" "}
										{totalNormalPrice.toLocaleString("id-ID")}
									</p>
								)}
							</div>
						</div>

						{/* Right: Image */}
						<div className="relative hidden lg:block">
							<div className="rounded-2xl overflow-hidden shadow-2xl bg-white/10">
								{heroCourse.thumbnail_url ? (
									<img
										src={heroCourse.thumbnail_url}
										alt={heroCourse.title}
										className="w-full h-auto"
									/>
								) : (
									<div className="w-full aspect-[4/3] bg-white/5 flex items-center justify-center">
										<span className="text-6xl text-white/20">
											{heroCourse.title.charAt(0)}
										</span>
									</div>
								)}
							</div>
							{/* Decorative elements */}
							<div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
							<div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
						</div>
					</div>
				) : (
					/* Default hero when no featured course */
					<div className="text-center max-w-3xl mx-auto">
						<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
							Belajar Persiapan Visa Amerika
						</h1>
						<p className="text-lg text-white/90 mb-8">
							Panduan lengkap dan terpercaya untuk mendapatkan visa Amerika
							Serikat. Belajar dari pengalaman nyata dan tips praktis.
						</p>
						{!isAuthenticated && (
							<Button
								size="lg"
								className="bg-white text-brand-primary hover:bg-white/90 font-semibold px-8"
								asChild
							>
								<Link to="/daftar">
									Mulai Belajar Gratis
									<ArrowRight className="w-4 h-4 ml-2" />
								</Link>
							</Button>
						)}
					</div>
				)}
			</div>
		</section>
	);

	return (
		<>
			<PaymentLoadingOverlay isLoading={createPayment.isPending} />
			<AuthAwareLayout heroSection={heroSection}>
			{/* Courses Section */}
			<section className="py-8">
				<div className="container mx-auto max-w-6xl">
					{/* Section Header */}
					<div className="flex items-center justify-between mb-8">
						<div>
							<h2 className="text-2xl font-bold text-foreground">
								{hasSearchQuery ? `Hasil pencarian "${searchQuery}"` : "Semua Kursus"}
							</h2>
							{regularCourses && regularCourses.length > 0 ? (
								<p className="text-muted-foreground mt-1">
									{regularCourses.length} kursus {hasSearchQuery ? "ditemukan" : "tersedia"}
									{!hasSearchQuery && bundle && " - beli satuan atau hemat dengan paket lengkap"}
								</p>
							) : hasSearchQuery && !isLoading ? (
								<p className="text-muted-foreground mt-1">
									Tidak ada kursus yang cocok
								</p>
							) : null}
						</div>
						{hasSearchQuery && (
							<Link
								to="/courses"
								className="text-sm text-brand-primary hover:underline"
							>
								Hapus filter
							</Link>
						)}
					</div>

					{/* Course Grid - only show regular courses, not the bundle */}
					{isLoading ? (
						<CourseGridLoading count={4} />
					) : error ? (
						<CourseGridError
							message={
								error instanceof Error
									? error.message
									: "Gagal memuat kursus"
							}
							onRetry={() => refetch()}
						/>
					) : (
						<CourseGrid
							courses={regularCourses || []}
							ownedCourseIds={enrolledCourseIds}
						/>
					)}
				</div>
			</section>
		</AuthAwareLayout>
		</>
	);
}
