import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useAdminCourses } from "@/features/courses/hooks";
import type { Course } from "@/lib/db/types";

export const Route = createFileRoute("/admin/courses/")({
  component: AdminCoursesPage,
});

function AdminCoursesPage() {
  const { data: courses, isLoading } = useAdminCourses();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = courses?.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manajemen Kursus
          </h1>
          <p className="text-muted-foreground">
            Kelola katalog kursus, materi, dan status publikasi.
          </p>
        </div>
        <Button asChild className="bg-brand-primary hover:bg-brand-primary/90">
          <Link to="/admin/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            Buat Kursus Baru
          </Link>
        </Button>
      </div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari judul kursus..."
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
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[100px] pl-4">Cover</TableHead>
              <TableHead>Info Kursus</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px] text-right pr-12">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading Skeleton Rows
              (Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-4">
                    <Skeleton className="h-16 w-16 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>
                  <TableCell className="text-right pr-12">
                    <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              )))
            ) : filteredCourses?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  Tidak ada kursus ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filteredCourses?.map((course) => (
                <CourseRow key={course.id} course={course} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function CourseRow({ course }: { course: Course }) {
  return (
    <TableRow className="hover:bg-muted/30 transition-colors">
      <TableCell className="pl-4">
        <div className="aspect-square w-16 rounded-md bg-muted overflow-hidden border border-border">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary text-xs font-bold text-muted-foreground">
              NO IMG
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-semibold text-foreground line-clamp-1">
            {course.title}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <span className="capitalize">
              {course.category || "Uncategorized"}
            </span>
            <span>•</span>
            <span>{course.instructor_name || "No Instructor"}</span>
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium text-sm">
          {course.price === 0
            ? "Gratis"
            : `Rp ${course.price.toLocaleString(`id-ID`)}`}
        </div>
      </TableCell>
      <TableCell>
        {course.is_published ? (
          <Badge className="bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200 shadow-none">
            Published
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-muted-foreground">
            Draft
          </Badge>
        )}
      </TableCell>

      <TableCell className="text-right pr-12">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>

            <DropdownMenuItem asChild>
              <Link
                to="/courses/$slug"
                params={{ slug: course.slug }}
                target="_blank"
              >
                <Eye className="mr-2 h-4 w-4" />
                Lihat Halaman
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                to="/admin/courses/$slug/edit"
                params={{ slug: course.slug }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Detail
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
