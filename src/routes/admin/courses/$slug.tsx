import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminCourse } from "@/features/courses/hooks";
import { CourseDetail } from "@/components/admin/course-detail";

export const Route = createFileRoute("/admin/courses/$slug")({
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();

  const { data: course, isLoading } = useAdminCourse(slug);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h2 className="text-xl font-semibold">Kursus tidak ditemukan</h2>
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/admin/courses" })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke List
        </Button>
      </div>
    );
  }

  return <CourseDetail course={course} />;
}

function PageSkeleton() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-[400px] w-full rounded-lg" />{" "}
          <Skeleton className="h-[150px] w-full rounded-lg" />
          <Skeleton className="h-[300px] w-full rounded-lg" />{" "}
        </div>

        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full rounded-lg" />{" "}
          <Skeleton className="h-[100px] w-full rounded-lg" />{" "}
          <Skeleton className="h-[200px] w-full rounded-lg" />{" "}
        </div>
      </div>
    </div>
  );
}
