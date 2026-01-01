import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Pencil,
  Clock,
  CheckCircle2,
  Globe,
  MonitorPlay,
  User,
  Film,
  Image as ImageIcon,
  Calendar,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Course } from "@/lib/db/types";

interface CourseDetailProps {
  course: Course;
}

export function CourseDetail({ course }: CourseDetailProps) {
  const navigate = useNavigate();

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const mainVideoId = (course.content as any)?.sections?.[0]?.lessons?.[0]
    ?.videoId;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Link
            to="/admin/courses"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Courses
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">Detail</span>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() =>
              navigate({ to: `/admin/courses/${course.slug}/edit` })
            }
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Kursus
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden bg-card">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-[320px] shrink-0 border-r border-border relative p-4">
            <div className="aspect-square w-full relative bg-muted rounded-lg overflow-hidden border">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <ImageIcon className="w-10 h-10 opacity-20" />
                  <span className="text-xs">No Thumbnail</span>
                </div>
              )}
            </div>
            <div className="absolute top-6 left-6">
              <Badge 
                variant={course.is_published ? "default" : "secondary"} 
                className={course.is_published ? "bg-green-600 hover:bg-green-700" : "bg-gray-200 text-gray-700"}
              >
                {course.is_published ? "Published" : "Draft"}
              </Badge>
            </div>
          </div>

          <div className="flex-1 p-6 flex flex-col gap-4">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline">
                  {course.category || "Uncategorized"}
                </Badge>
                <Badge variant="outline">{course.level || "Semua Level"}</Badge>
                {course.is_featured && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-700"
                  >
                    Featured
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">
                {course.title}
              </h1>
              <p className="text-muted-foreground leading-relaxed line-clamp-3 md:line-clamp-none">
                {course.short_description || "Belum ada deskripsi singkat."}
              </p>
            </div>

            <div className="mt-auto pt-6 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Harga
                </span>
                <p className="font-bold text-lg text-brand-primary">
                  {course.price === 0 ? "Gratis" : formatRupiah(course.price)}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Durasi
                </span>
                <p className="font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {course.duration_minutes} Menit
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Materi
                </span>
                <p className="font-medium flex items-center gap-1">
                  <MonitorPlay className="w-4 h-4 text-muted-foreground" />
                  {mainVideoId ? "1 Video Utama" : "0 Video"}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Update
                </span>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {formatDate(course.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="w-4 h-4 text-brand-primary" />
                Apa yang akan dipelajari?
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(course.metadata?.whatYouWillLearn?.length ?? 0) > 0 ? (
                <ul className="grid grid-cols-1 gap-2">
                  {course.metadata?.whatYouWillLearn?.map(
                    (point: string, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm text-foreground/80 p-2 rounded hover:bg-muted/50 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <span className="leading-snug">{point}</span>
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <div className="text-center py-6 text-muted-foreground bg-muted/20 rounded border border-dashed text-sm">
                  Belum ada poin pembelajaran yang diatur.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Film className="w-4 h-4 text-brand-primary" />
                Video & Assets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/30 p-3 rounded-lg border">
                  <span className="text-xs text-muted-foreground font-medium uppercase mb-1 block">
                    Video Trailer ID
                  </span>
                  {course.preview_video_url ? (
                    <code className="bg-background px-2 py-1 rounded border text-xs font-mono block w-full truncate">
                      {course.preview_video_url}
                    </code>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      Tidak ada trailer
                    </span>
                  )}
                </div>
                <div className="bg-muted/30 p-3 rounded-lg border">
                  <span className="text-xs text-muted-foreground font-medium uppercase mb-1 block">
                    Main Course Video ID
                  </span>
                  {mainVideoId ? (
                    <code className="bg-background px-2 py-1 rounded border text-xs font-mono block w-full truncate text-brand-primary font-bold">
                      {mainVideoId}
                    </code>
                  ) : (
                    <span className="text-xs text-destructive italic">
                      Video utama belum diatur!
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Instruktur</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted overflow-hidden border shrink-0">
                  {course.instructor_avatar ? (
                    <img
                      src={course.instructor_avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="overflow-hidden">
                  <p
                    className="font-medium text-sm leading-none truncate"
                    title={course.instructor_name || ""}
                  >
                    {course.instructor_name || "Belum diatur"}
                  </p>
                  <p
                    className="text-xs text-muted-foreground mt-1 truncate"
                    title={course.instructor_title || ""}
                  >
                    {course.instructor_title || "Instructor"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground block mb-1">
                  Slug URL
                </span>
                <div className="flex items-center gap-1 text-foreground bg-muted p-1.5 rounded border">
                  <Globe className="w-3 h-3" />
                  <span className="font-mono truncate">{course.slug}</span>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">
                  Course UUID
                </span>
                <code className="text-[10px] text-muted-foreground font-mono break-all">
                  {course.id}
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
