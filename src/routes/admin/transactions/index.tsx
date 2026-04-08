import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
	Calendar,
	Copy,
	CreditCard,
	Package,
	PackageCheck,
	Phone,
	Search,
	User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAdminTransactions } from "@/features/transactions/hooks";
import { formatPrice } from "@/lib/utils";

// Search params validation schema - must match the one in useAdminTransactions hook
const searchParamsSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().default(10),
	q: z.string().optional().default(""),
	status: z
		.enum(["all", "pending", "paid", "failed", "expired", "refunded"])
		.default("all"),
});

type TransactionSearchParams = z.infer<typeof searchParamsSchema>;

export const Route = createFileRoute("/admin/transactions/")({
	validateSearch: (search: Record<string, unknown>): TransactionSearchParams => {
		return searchParamsSchema.parse(search);
	},
	component: AdminTransactionsPage,
});

function AdminTransactionsPage() {
	const navigate = useNavigate();
	const { page, limit, q, status } = Route.useSearch();

	// Local state for the search input to allow immediate typing
	const [searchQuery, setSearchQuery] = useState(q);

	const { data, isLoading } = useAdminTransactions({
		page,
		limit,
		searchQuery: q,
		statusFilter: status === "all" ? undefined : status,
	});

	// Synchronize local search query with URL params
	useEffect(() => {
		setSearchQuery(q);
	}, [q]);

	const updateParams = (newParams: Partial<TransactionSearchParams>) => {
		navigate({
			to: ".",
			search: (prev: any) => ({
				...prev,
				...newParams,
				// Reset to page 1 if searching or filtering unless explicitly changing page
				page:
					newParams.page ??
					(newParams.q !== undefined || newParams.status !== undefined
						? 1
						: prev.page),
			}),
		});
	};

	const filteredData = data?.data || [];
	const totalCount = data?.totalCount || 0;

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "paid":
				return (
					<Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 shadow-none">
						Lunas
					</Badge>
				);
			case "pending":
				return (
					<Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200 shadow-none">
						Pending
					</Badge>
				);
			case "failed":
				return (
					<Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 shadow-none">
						Gagal
					</Badge>
				);
			default:
				return (
					<Badge variant="outline" className="capitalize shadow-none">
						{status}
					</Badge>
				);
		}
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		toast.success("ID Transaksi dikopi!");
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Transaksi</h1>
					<p className="text-muted-foreground">
						Riwayat pembelian dan status pembayaran.
					</p>
				</div>
			</div>

			<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-card p-4 rounded-xl border border-border shadow-sm">
				<div className="relative flex-1 max-w-sm w-full">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<form onSubmit={(e) => { e.preventDefault(); updateParams({ q: searchQuery }); }}>
						<Input
							placeholder="Cari user, email, atau kursus..."
							className="pl-9 bg-background"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onBlur={() => updateParams({ q: searchQuery })}
						/>
					</form>
				</div>
				<Select value={status} onValueChange={(val: any) => updateParams({ status: val })}>
					<SelectTrigger className="w-full sm:w-[180px] bg-background">
						<SelectValue placeholder="Status Pembayaran" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Semua Status</SelectItem>
						<SelectItem value="paid">Lunas</SelectItem>
						<SelectItem value="pending">Pending</SelectItem>
						<SelectItem value="expired">Kedaluwarsa</SelectItem>
						<SelectItem value="failed">Gagal</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/50 hover:bg-muted/50">
							<TableHead className="w-[250px] pl-4">User</TableHead>
							<TableHead>Produk</TableHead>
							<TableHead className="w-[150px]">Total</TableHead>
							<TableHead className="w-[150px]">Metode</TableHead>
							<TableHead className="w-[100px]">Status</TableHead>
							<TableHead className="text-right pr-6 w-[150px]">
								Tanggal
							</TableHead>
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
										<Skeleton className="h-4 w-40" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-6 w-16" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-24 ml-auto" />
									</TableCell>
								</TableRow>
							))
						) : filteredData?.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={6}
									className="h-24 text-center text-muted-foreground"
								>
									Belum ada transaksi.
								</TableCell>
							</TableRow>
						) : (
							filteredData?.map((trx) => (
								<TableRow
									key={trx.id}
									className="hover:bg-muted/30 transition-colors"
								>
									<TableCell className="pl-4 py-3 align-top">
										<div className="flex items-center gap-3">
											<div className="h-9 w-9 rounded-full bg-muted overflow-hidden flex items-center justify-center border shrink-0">
												{trx.user_avatar ? (
													<img
														src={trx.user_avatar}
														alt=""
														className="h-full w-full object-cover"
													/>
												) : (
													<User className="h-4 w-4 text-muted-foreground" />
												)}
											</div>
											<div className="flex flex-col max-w-[180px]">
												<span className="font-medium truncate text-sm">
													{trx.user_name || "Tanpa Nama"}
												</span>
												<span
													className="text-xs text-muted-foreground truncate"
													title={trx.user_email || ""}
												>
													{trx.user_email}
												</span>
												<span className="text-[10px] text-muted-foreground truncate font-mono">
													{trx.user_whatsapp || "-"}
												</span>
											</div>
										</div>
									</TableCell>

									<TableCell className="py-3">
										{trx.item_count > 1 ? (
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<div className="flex flex-col cursor-help">
															<div className="flex items-center gap-2 font-semibold text-brand-primary">
																<PackageCheck className="w-4 h-4" />
																<span>Paket Semua Kursus</span>
															</div>
														</div>
													</TooltipTrigger>
													<TooltipContent className="max-w-[300px] bg-foreground text-background">
														<p className="font-semibold mb-2 text-xs border-b border-border/20 pb-1">
															Detail Item:
														</p>
														<ul className="list-disc pl-4 space-y-1">
															{trx.all_titles.map((title, idx) => (
																<li key={idx} className="text-xs">
																	{title}
																</li>
															))}
														</ul>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										) : (
											<div className="flex items-start gap-2">
												<span className="font-medium text-sm leading-relaxed text-foreground">
													{trx.all_titles[0] || "Unknown Course"}
												</span>
											</div>
										)}
										<div 
											onClick={() => copyToClipboard(trx.payment_reference || "")}
											className="flex items-center gap-1.5 cursor-pointer hover:bg-muted/80 py-0.5 px-1 rounded transition-colors w-fit mt-1"
											title="Klik untuk kopi ID Transaksi"
										>
											<span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1 rounded border">
												{trx.payment_reference || "NO-REF"}
											</span>
											<Copy className="w-2.5 h-2.5 text-muted-foreground opacity-50" />
										</div>
									</TableCell>

									{/* Total Amount */}
									<TableCell className="py-3 align-top">
										<span className="font-bold text-sm text-foreground">
											{formatPrice(trx.total_amount)}
										</span>
									</TableCell>

									{/* Metode Pembayaran */}
									<TableCell className="py-3 align-top">
										<div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1.5 rounded w-fit border border-border/50">
											<CreditCard className="w-3 h-3" />
											<span className="capitalize whitespace-nowrap">
												{trx.payment_method
													? trx.payment_method.replace("_", " ")
													: "-"}
											</span>
										</div>
									</TableCell>

									{/* Status */}
									<TableCell className="py-3 align-top">
										{getStatusBadge(trx.payment_status)}
									</TableCell>

									{/* Tanggal */}
									<TableCell className="text-right pr-6 py-3 align-top text-muted-foreground text-sm">
										<div className="flex flex-col items-end">
											<span className="flex items-center gap-1.5 font-medium">
												<Calendar className="w-3 h-3" />
												{format(new Date(trx.created_at), "dd MMM yyyy", {
													locale: idLocale,
												})}
											</span>
											<span className="text-[10px] opacity-70">
												{format(new Date(trx.created_at), "HH:mm")}
											</span>
										</div>
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
				onPageChange={(p: number) => updateParams({ page: p })}
				onLimitChange={(l: number) => updateParams({ limit: l })}
				itemCountOnPage={filteredData.length}
				label="transaksi"
			/>
		</div>
	);
}
