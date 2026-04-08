import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps {
  page: number;
  limit: number;
  totalCount: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  label?: string; // e.g. "transaksi" or "pengguna"
  itemCountOnPage: number;
}

export function DataTablePagination({
  page,
  limit,
  totalCount,
  isLoading,
  onPageChange,
  onLimitChange,
  label = "data",
  itemCountOnPage,
}: DataTablePaginationProps) {
  const totalPages = Math.ceil(totalCount / limit);
  const [jumpValue, setJumpValue] = useState(page.toString());

  // Synchronize jump input with current page
  useEffect(() => {
    setJumpValue(page.toString());
  }, [page]);

  const handleJump = () => {
    const val = parseInt(jumpValue);
    if (!isNaN(val) && val >= 1 && val <= totalPages) {
      if (val !== page) {
        onPageChange(val);
      }
    } else {
      setJumpValue(page.toString());
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [1];
    
    // Show ellipsis if far from start
    if (page > 3) {
      pages.push("...");
    }

    // Determine range around current page
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    // Adjust range if near boundaries to keep a consistent number of buttons
    let adjustedStart = start;
    let adjustedEnd = end;
    
    if (page <= 3) {
      adjustedEnd = 4;
    } else if (page >= totalPages - 2) {
      adjustedStart = totalPages - 3;
    }

    for (let i = adjustedStart; i <= adjustedEnd; i++) {
      if (!pages.includes(i)) pages.push(i);
    }

    // Show ellipsis if far from end
    if (page < totalPages - 2) {
      pages.push("...");
    }

    if (!pages.includes(totalPages)) pages.push(totalPages);
    
    return pages;
  };

  if (totalCount === 0 && !isLoading) return null;

  return (
    <div className="p-4 border-t border-border flex flex-col lg:flex-row items-center justify-between gap-4">
      {/* Left side: Item summary */}
      <div className="text-sm text-muted-foreground order-3 lg:order-1 w-full lg:w-auto text-center lg:text-left">
        Menampilkan <strong>{itemCountOnPage}</strong> dari <strong>{totalCount}</strong> {label}
      </div>

      {/* Right side: Controls */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 lg:gap-8 order-1 lg:order-2 w-full lg:w-auto">
        {/* Rows per page selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">
            Baris per halaman:
          </span>
          <Select
            value={limit.toString()}
            onValueChange={(val) => onLimitChange(parseInt(val))}
            disabled={isLoading}
          >
            <SelectTrigger className="h-8 w-[70px] bg-background shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Direct page jump input */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">
            Lompat ke:
          </span>
          <Input
            className="h-8 w-14 text-center p-0 text-xs font-bold bg-background shadow-none focus-visible:ring-1"
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && handleJump()}
            onBlur={handleJump}
            disabled={isLoading || totalPages <= 1}
          />
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1 order-2 sm:order-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 hover:bg-muted"
            onClick={() => onPageChange(1)}
            disabled={page <= 1 || isLoading}
            title="Halaman Pertama"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 hover:bg-muted"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
            title="Sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1 mx-1">
            {getPageNumbers().map((pageNum, idx) => (
              <div key={idx}>
                {pageNum === "..." ? (
                  <span className="px-1 text-muted-foreground text-[10px] font-bold tracking-widest">
                    •••
                  </span>
                ) : (
                  <Button
                    variant={page === pageNum ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8 text-xs font-semibold shadow-none"
                    onClick={() => onPageChange(pageNum as number)}
                    disabled={isLoading}
                  >
                    {pageNum}
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 hover:bg-muted"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
            title="Berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 hover:bg-muted"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages || isLoading}
            title="Halaman Terakhir"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
