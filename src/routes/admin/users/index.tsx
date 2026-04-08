import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Phone, Search, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { useAdminUsers } from "@/features/users/hooks";

// Search params validation schema
const searchParamsSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().default(10),
	q: z.string().optional().default(""),
});

type UsersSearchParams = z.infer<typeof searchParamsSchema>;

export const Route = createFileRoute("/admin/users/")({
	validateSearch: (search: Record<string, unknown>): UsersSearchParams => {
		return searchParamsSchema.parse(search);
	},
	component: AdminUsersPage,
});

const UserAvatarCell = ({
	url,
	name,
}: {
	url?: string | null;
	name: string;
}) => {
	const [error, setError] = useState(false);

	if (url && !error) {
		return (
			<img
				src={url}
				alt={name}
				className="h-full w-full object-cover"
				onError={() => setError(true)}
			/>
		);
	}

	return (
		<div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground font-semibold">
			{name.charAt(0).toUpperCase()}
		</div>
	);
};

function AdminUsersPage() {
	const navigate = useNavigate();
	const { page, limit, q } = Route.useSearch();

	// Local state for immediate input feedback
	const [searchQuery, setSearchQuery] = useState(q);

	const { data, isLoading } = useAdminUsers({
		page,
		limit,
		searchQuery: q,
	});

	// Synchronize local state with URL params
	useEffect(() => {
		setSearchQuery(q);
	}, [q]);

	const updateParams = (newParams: Partial<UsersSearchParams>) => {
		navigate({
			to: ".",
			search: (prev) => ({
				...prev,
				...newParams,
				// Reset to page 1 if query changes
				page:
					newParams.page ?? (newParams.q !== undefined ? 1 : prev.page),
			}),
		});
	};

	const users = data?.data || [];
	const totalCount = data?.totalCount || 0;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Pengguna</h1>
				<p className="text-muted-foreground">
					Daftar semua pengguna yang terdaftar di aplikasi.
				</p>
			</div>

			{/* Toolbar */}
			<div className="flex items-center gap-2 bg-card p-4 rounded-xl border border-border shadow-sm">
				<form
					className="relative flex-1 max-w-sm"
					onSubmit={(e) => {
						e.preventDefault();
						updateParams({ q: searchQuery });
					}}
				>
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Cari nama atau email..."
						className="pl-9 bg-background"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onBlur={() => updateParams({ q: searchQuery })}
					/>
				</form>
			</div>

			{/* Table Content */}
			<div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow className="bg-muted/50 hover:bg-muted/50">
								<TableHead className="w-[80px] pl-4">Avatar</TableHead>
								<TableHead>User Info</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Kontak</TableHead>
								<TableHead>Bergabung</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								// Skeleton Loading
								Array.from({ length: 5 }).map((_, i) => (
									<TableRow key={i}>
										<TableCell className="pl-4">
											<Skeleton className="h-10 w-10 rounded-full" />
										</TableCell>
										<TableCell>
											<div className="space-y-2">
												<Skeleton className="h-4 w-32" />
												<Skeleton className="h-3 w-40" />
											</div>
										</TableCell>
										<TableCell>
											<Skeleton className="h-5 w-16" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-24" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-24" />
										</TableCell>
									</TableRow>
								))
							) : users.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="h-24 text-center text-muted-foreground"
									>
										Tidak ada pengguna ditemukan.
									</TableCell>
								</TableRow>
							) : (
								users.map((user) => (
									<TableRow key={user.id} className="hover:bg-muted/30">
										<TableCell className="pl-4">
											<div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center border">
												<UserAvatarCell
													url={user.avatar_url}
													name={user.full_name || "?"}
												/>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex flex-col">
												<span className="font-medium">
													{user.full_name || "Tanpa Nama"}
												</span>
												<span className="text-xs text-muted-foreground">
													{user.email}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<Badge
												variant={
													user.role === "admin" ? "default" : "secondary"
												}
												className="capitalize shadow-none"
											>
												{user.role === "admin" && (
													<Shield className="w-3 h-3 mr-1" />
												)}
												{user.role}
											</Badge>
										</TableCell>
										<TableCell>
											{user.whatsapp_number ? (
												<div className="flex items-center gap-1 text-sm text-foreground">
													<Phone className="w-3 h-3 text-muted-foreground" />{" "}
													{user.whatsapp_number}
												</div>
											) : (
												<span className="text-muted-foreground text-xs">
													-
												</span>
											)}
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">
											{format(new Date(user.created_at), "dd MMM yyyy", {
												locale: idLocale,
											})}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>

				<DataTablePagination
					page={page}
					limit={limit}
					totalCount={totalCount}
					isLoading={isLoading}
					onPageChange={(p) => updateParams({ page: p })}
					onLimitChange={(l) => updateParams({ limit: l })}
					itemCountOnPage={users.length}
					label="pengguna"
				/>
			</div>
		</div>
	);
}
