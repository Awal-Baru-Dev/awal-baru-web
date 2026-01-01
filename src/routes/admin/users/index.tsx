import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, User, Shield, Phone } from "lucide-react";
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
import { useAdminUsers } from "@/features/users/hooks";

export const Route = createFileRoute("/admin/users/")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const { data: users, isLoading } = useAdminUsers();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users?.filter(
    (user) =>
      (user.full_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau email..."
            className="pl-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {/* FIX: Tambahkan pl-4 agar sejajar dengan Course List */}
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
                  {/* FIX: Tambahkan pl-4 di Skeleton juga */}
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
            ) : filteredUsers?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  Tidak ada pengguna ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers?.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/30">
                  {/* FIX: Tambahkan pl-4 di sini */}
                  <TableCell className="pl-4">
                    <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center border">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name || ""}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
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
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {user.role === "admin" && (
                        <Shield className="w-3 h-3 mr-1" />
                      )}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.phone ? (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" /> {user.phone}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
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
    </div>
  );
}
