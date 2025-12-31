import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/transactions")({
  component: () => <div className="p-4">Halaman Transaksi</div>,
});
