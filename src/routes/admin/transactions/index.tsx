import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, User, CreditCard, Calendar, PackageCheck } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useAdminTransactions } from "@/features/transactions/hooks";
import type { AdminTransaction } from "@/lib/db/types";

export const Route = createFileRoute("/admin/transactions/")({
  component: AdminTransactionsPage,
});

// Interface untuk data yang sudah di-grouping
interface GroupedTransaction extends AdminTransaction {
  item_count: number;
  all_titles: string[];
  total_amount: number;
}

function AdminTransactionsPage() {
  const { data: transactions, isLoading } = useAdminTransactions();
  const [searchQuery, setSearchQuery] = useState("");

  // LOGIC GROUPING
  const groupedTransactions = useMemo(() => {
    if (!transactions) return [];

    const groups: Record<string, GroupedTransaction> = {};

    transactions.forEach((trx) => {
      // Key unik: Payment Ref ATAU User+Waktu (presisi detik)
      const uniqueKey =
        trx.payment_reference ||
        `${trx.user_email}-${new Date(trx.created_at).getTime()}`;

      if (!groups[uniqueKey]) {
        groups[uniqueKey] = {
          ...trx,
          item_count: 1,
          all_titles: [trx.course_title || "Kursus"],
          total_amount: trx.amount_paid,
        };
      } else {
        groups[uniqueKey].item_count += 1;
        groups[uniqueKey].all_titles.push(trx.course_title || "Kursus");
        // Jika harga paket dicatat per item, kita jumlahkan. 
        // Jika dicatat di salah satu item saja, ini juga aman.
        groups[uniqueKey].total_amount += trx.amount_paid;
      }
    });

    return Object.values(groups).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [transactions]);

  // FILTERING
  const filteredData = groupedTransactions.filter((item) => {
    const query = searchQuery.toLowerCase();
    // Cari user ATAU cari "Paket Semua Kursus" ATAU judul satuan
    return (
      (item.user_name || "").toLowerCase().includes(query) ||
      (item.user_email || "").toLowerCase().includes(query) ||
      (item.item_count > 1 && "paket semua kursus".includes(query)) || 
      item.all_titles.some((title) => title.toLowerCase().includes(query))
    );
  });

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 shadow-none">Lunas</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200 shadow-none">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 shadow-none">Gagal</Badge>;
      default:
        return <Badge variant="outline" className="capitalize shadow-none">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaksi</h1>
          <p className="text-muted-foreground">Riwayat pembelian dan status pembayaran.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari user, email, atau kursus..."
            className="pl-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
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
              <TableHead className="text-right pr-6 w-[150px]">Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton Loading
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-4"><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredData?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Belum ada transaksi.
                </TableCell>
              </TableRow>
            ) : (
              filteredData?.map((trx) => (
                <TableRow key={trx.id} className="hover:bg-muted/30 transition-colors">
                  {/* User Info */}
                  <TableCell className="pl-4 py-3 align-top">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-muted overflow-hidden flex items-center justify-center border shrink-0">
                        {trx.user_avatar ? (
                          <img src={trx.user_avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-col max-w-[180px]">
                        <span className="font-medium truncate text-sm">{trx.user_name || "Tanpa Nama"}</span>
                        <span className="text-xs text-muted-foreground truncate" title={trx.user_email || ""}>
                          {trx.user_email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Produk / Kursus */}
                  <TableCell className="py-3 align-top">
                    {trx.item_count > 1 ? (
                      // TAMPILAN PAKET (Single Line)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex flex-col cursor-help">
                              <div className="flex items-center gap-2 font-semibold text-brand-primary">
                                <PackageCheck className="w-4 h-4" />
                                <span>Paket Semua Kursus</span>
                              </div>
                              <span className="text-xs text-muted-foreground mt-0.5">
                                Bundle {trx.item_count} Materi
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[300px] bg-foreground text-background">
                            <p className="font-semibold mb-2 text-xs border-b border-border/20 pb-1">Detail Item:</p>
                            <ul className="list-disc pl-4 space-y-1">
                              {trx.all_titles.map((title, idx) => (
                                <li key={idx} className="text-xs">{title}</li>
                              ))}
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      // TAMPILAN SATUAN
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-sm leading-relaxed text-foreground">
                           {trx.course_title || "Unknown Course"}
                        </span>
                      </div>
                    )}
                  </TableCell>

                  {/* Total Amount */}
                  <TableCell className="py-3 align-top">
                    <span className="font-bold text-sm text-foreground">
                      {formatRupiah(trx.total_amount)}
                    </span>
                  </TableCell>

                  {/* Metode Pembayaran */}
                  <TableCell className="py-3 align-top">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1.5 rounded w-fit border border-border/50">
                      <CreditCard className="w-3 h-3" />
                      <span className="capitalize whitespace-nowrap">
                        {trx.payment_method ? trx.payment_method.replace("_", " ") : "-"}
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
                        {format(new Date(trx.created_at), "dd MMM yyyy", { locale: idLocale })}
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
    </div>
  );
}