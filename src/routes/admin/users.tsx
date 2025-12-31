import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/users")({
  component: () => (
    <div className="p-4">Halaman Manajemen User (Coming Soon)</div>
  ),
});
