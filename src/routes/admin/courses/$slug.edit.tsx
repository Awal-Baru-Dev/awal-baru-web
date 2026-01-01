import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { CourseForm, CourseFormValues } from "@/components/admin/course-form";
import { useAdminCourse } from "@/features/courses/hooks";
import { updateCourse, uploadCourseAsset, deleteStorageFile } from "@/features/courses/actions";

export const Route = createFileRoute("/admin/courses/$slug/edit")({
  component: EditCoursePage,
});

function EditCoursePage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { data: course, isLoading: isFetching } = useAdminCourse(slug);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  if (isFetching) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!course) {
    return <div>Kursus tidak ditemukan.</div>;
  }

  const handleSubmit = async (values: CourseFormValues) => {
    setIsSubmitting(true);
    try {
      let thumbnailUrl = course.thumbnail_url;
      if (values.thumbnailFile) {
        if (course.thumbnail_url) {
          await deleteStorageFile(course.thumbnail_url, "course-assets");
        }

        const ext = values.thumbnailFile.name.split(".").pop();
        const fileName = `${values.slug}-${Date.now()}.${ext}`;
        thumbnailUrl = await uploadCourseAsset(
          values.thumbnailFile,
          "course-assets",
          fileName
        );
      }

      let avatarUrl = course.instructor_avatar;
      if (values.avatarFile) {
        if (course.instructor_avatar) {
          await deleteStorageFile(course.instructor_avatar, "avatars");
        }

        const ext = values.avatarFile.name.split(".").pop();
        const fileName = `instructor-${values.slug}-${Date.now()}.${ext}`;
        avatarUrl = await uploadCourseAsset(
          values.avatarFile,
          "avatars",
          fileName
        );
      }

      const durationString = values.duration_minutes
        ? `${values.duration_minutes}:00`
        : "00:00";

      let contentJson = course.content;

      if (values.video_id) {
        contentJson = {
          sections: [
            {
              id: "01",
              title: "Materi Utama",
              lessons: [
                {
                  title: values.title,
                  isFree: false,
                  videoId: values.video_id,
                  duration: durationString,
                  startTime: 0,
                },
              ],
            },
          ],
        };
      }

      const metadataJson = {
        ...course.metadata,
        whatYouWillLearn:
          values.what_you_will_learn
            ?.map((item) => item.value)
            .filter((v) => v.trim() !== "") || [],
      };

      const payload = {
        title: values.title,
        slug: values.slug,
        short_description: values.short_description,
        price: values.price,
        original_price: values.original_price || null,
        category: values.category,
        level: values.level,
        duration_minutes: values.duration_minutes || 0,

        instructor_name: values.instructor_name,
        instructor_title: values.instructor_title,
        instructor_avatar: avatarUrl,

        thumbnail_url: thumbnailUrl,
        preview_video_url: values.preview_video_url,
        is_published: values.is_published,

        content: contentJson,
        metadata: metadataJson,
      };

      const result = await updateCourse(slug, payload);

      if (result.error) {
        toast.error("Gagal mengupdate kursus", {
          description: result.error,
        });
        return;
      }

      toast.success("Kursus berhasil diperbarui!");
      await queryClient.invalidateQueries({ queryKey: ["courses"] });
      await queryClient.invalidateQueries({ queryKey: ["course", slug] });
      navigate({ to: "/admin/courses" });
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <CourseForm
        initialData={course}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}
