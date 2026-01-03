import { CheckCircle2, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/db/types";

interface CourseLearnSidebarProps {
  course: Course | null | undefined;
  progress: number;
  className?: string;
}

export function CourseLearnSidebar({
  course,
  progress,
  className,
}: CourseLearnSidebarProps) {
  if (!course) return null;

  return (
    <div className={cn("space-y-6", className)}>
      {/* 1. CARD PROGRESS */}
      <Card className="border-l-4 border-l-brand-primary shadow-sm">
        <CardContent className="p-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Progress Belajar
              </span>
              <span className="text-lg font-bold text-brand-primary">
                {Math.round(progress)}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-primary transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Status Text */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              {progress >= 100 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 font-medium">
                    Kursus Selesai
                  </span>
                </>
              ) : (
                <span>
                  {progress >= 90
                    ? "Sedikit lagi! Tonton sampai habis."
                    : "Lanjutkan menonton untuk menyimpan progress."}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. CARD INSTRUKTUR */}
      {course.instructor_name && (
        <Card className="shadow-sm">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-base">Instruktur</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {" "}
              <div className="relative h-10 w-10 rounded-full overflow-hidden bg-secondary border border-border flex-shrink-0">
                {course.instructor_avatar ? (
                  <img
                    src={course.instructor_avatar}
                    alt={course.instructor_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-brand-primary font-bold text-sm bg-brand-primary/10">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-foreground truncate">
                  {course.instructor_name}
                </p>
                {course.instructor_title && (
                  <p className="text-xs text-muted-foreground truncate">
                    {course.instructor_title}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
