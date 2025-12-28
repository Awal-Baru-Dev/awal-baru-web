import { Link } from "@tanstack/react-router";
import {
	ShoppingCart,
	PlayCircle,
	Infinity,
	Award,
	Users,
	FileText,
	CreditCard,
	Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/db/types";

interface CourseSidebarProps {
	course: Course;
	isEnrolled?: boolean;
	onPurchase?: () => void;
	className?: string;
}

/**
 * Format price to Indonesian Rupiah
 */
function formatPrice(price: number): string {
	return `Rp ${price.toLocaleString("id-ID")}`;
}

/**
 * Calculate discount percentage
 */
function getDiscountPercent(original: number, current: number): number {
	if (!original || original <= current) return 0;
	return Math.round(((original - current) / original) * 100);
}

/**
 * Course Sidebar Component (Purchase Card)
 *
 * Displays pricing and CTA for non-enrolled users,
 * or "Continue Learning" for enrolled users.
 *
 * Desktop: Sticky sidebar
 * Mobile: Fixed bottom bar (handled by parent)
 */
export function CourseSidebar({
	course,
	isEnrolled = false,
	onPurchase,
	className,
}: CourseSidebarProps) {
	const discount = getDiscountPercent(
		course.original_price || 0,
		course.price,
	);
	const features = course.metadata?.features || [];

	// Default features if none provided
	const displayFeatures =
		features.length > 0
			? features
			: [
					"Akses 12 bulan",
					`${course.lessons_count} video pelajaran`,
					"Update materi gratis",
					"Akses komunitas eksklusif",
				];

	const featureIcons: Record<string, React.ReactNode> = {
		akses: <Infinity className="w-4 h-4" />,
		video: <PlayCircle className="w-4 h-4" />,
		update: <FileText className="w-4 h-4" />,
		komunitas: <Users className="w-4 h-4" />,
		materi: <FileText className="w-4 h-4" />,
	};

	const getFeatureIcon = (feature: string) => {
		const lowerFeature = feature.toLowerCase();
		for (const [key, icon] of Object.entries(featureIcons)) {
			if (lowerFeature.includes(key)) return icon;
		}
		return <PlayCircle className="w-4 h-4" />;
	};

	if (isEnrolled) {
		return (
			<div
				className={cn(
					"bg-card border border-border rounded-xl p-6 space-y-4",
					className,
				)}
			>
				<div className="text-center pb-4 border-b border-border">
					<div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
						<Award className="w-6 h-6 text-brand-primary" />
					</div>
					<p className="font-medium text-foreground">Kamu sudah terdaftar!</p>
					<p className="text-sm text-muted-foreground mt-1">
						Lanjutkan belajar kapan saja.
					</p>
				</div>

				<Button className="w-full btn-cta" size="lg" asChild>
					<Link
						to="/courses/$slug/learn"
						params={{ slug: course.slug }}
					>
						<PlayCircle className="w-5 h-5 mr-2" />
						Lanjutkan Belajar
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"bg-card border border-border rounded-xl p-6 space-y-6",
				className,
			)}
		>
			{/* Price Section */}
			<div className="text-center">
				<div className="flex items-center justify-center gap-2 mb-1">
					<span className="text-3xl font-bold text-foreground">
						{formatPrice(course.price)}
					</span>
					{discount > 0 && (
						<span className="bg-destructive text-destructive-foreground text-xs font-medium px-2 py-1 rounded">
							-{discount}%
						</span>
					)}
				</div>
				{discount > 0 && course.original_price && (
					<span className="text-muted-foreground line-through">
						{formatPrice(course.original_price)}
					</span>
				)}
			</div>

			{/* CTA Button */}
			<Button className="w-full btn-cta" size="lg" onClick={onPurchase}>
				<ShoppingCart className="w-5 h-5 mr-2" />
				Beli Sekarang
			</Button>

			{/* Divider */}
			<div className="border-t border-border" />

			{/* Features List */}
			<div className="space-y-3">
				<p className="text-sm font-medium text-foreground">
					Yang kamu dapatkan:
				</p>
				<ul className="space-y-2.5">
					{displayFeatures.map((feature, index) => (
						<li
							key={`feature-${index}`}
							className="flex items-center gap-3 text-sm text-muted-foreground"
						>
							<span className="text-brand-primary">
								{getFeatureIcon(feature)}
							</span>
							<span>{feature}</span>
						</li>
					))}
				</ul>
			</div>

			{/* Divider */}
			<div className="border-t border-border" />

			{/* Payment Methods */}
			<div className="space-y-3">
				<p className="text-xs text-muted-foreground text-center">
					Metode pembayaran
				</p>
				<div className="flex items-center justify-center gap-4 text-muted-foreground">
					<CreditCard className="w-6 h-6" />
					<Wallet className="w-6 h-6" />
					<div className="px-2 py-1 bg-muted rounded text-xs font-medium">
						QRIS
					</div>
					<div className="px-2 py-1 bg-muted rounded text-xs font-medium">
						VA
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Mobile Purchase Bar (Fixed Bottom)
 *
 * Simplified version for mobile devices.
 */
export function CourseMobilePurchaseBar({
	course,
	isEnrolled = false,
	onPurchase,
	className,
}: CourseSidebarProps) {
	const discount = getDiscountPercent(
		course.original_price || 0,
		course.price,
	);

	if (isEnrolled) {
		return (
			<div
				className={cn(
					"fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 flex items-center justify-between gap-4 z-50 lg:hidden",
					className,
				)}
			>
				<div>
					<p className="text-sm text-muted-foreground">Sudah terdaftar</p>
				</div>
				<Button className="btn-cta" asChild>
					<Link
						to="/courses/$slug/learn"
						params={{ slug: course.slug }}
					>
						Lanjutkan
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 flex items-center justify-between gap-4 z-50 lg:hidden",
				className,
			)}
		>
			<div>
				<div className="flex items-center gap-2">
					<span className="text-lg font-bold text-foreground">
						{formatPrice(course.price)}
					</span>
					{discount > 0 && course.original_price && (
						<span className="text-sm text-muted-foreground line-through">
							{formatPrice(course.original_price)}
						</span>
					)}
				</div>
			</div>
			<Button className="btn-cta" onClick={onPurchase}>
				<ShoppingCart className="w-4 h-4 mr-2" />
				Beli Sekarang
			</Button>
		</div>
	);
}

/**
 * Skeleton loading state for CourseSidebar
 */
export function CourseSidebarSkeleton() {
	return (
		<div className="bg-card border border-border rounded-xl p-6 space-y-6">
			{/* Price skeleton */}
			<div className="text-center space-y-2">
				<Skeleton className="h-8 w-32 mx-auto" />
				<Skeleton className="h-4 w-24 mx-auto" />
			</div>

			{/* Button skeleton */}
			<Skeleton className="h-12 w-full rounded-md" />

			<div className="border-t border-border" />

			{/* Features skeleton */}
			<div className="space-y-3">
				<Skeleton className="h-4 w-32" />
				<div className="space-y-2.5">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-5 w-full" />
					))}
				</div>
			</div>
		</div>
	);
}
