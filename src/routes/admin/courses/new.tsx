import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { CourseForm, CourseFormValues } from "@/components/admin/course-form";
import { createCourse, uploadCourseAsset } from "@/features/courses/actions";
import { useState } from "react";

export const Route = createFileRoute("/admin/courses/new")({
  component: NewCoursePage,
});

function NewCoursePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: CourseFormValues) => {
    setIsSubmitting(true);
    try {
      let thumbnailUrl = null;
      if (values.thumbnailFile) {
        const ext = values.thumbnailFile.name.split(".").pop();
        const fileName = `${values.slug}-${Date.now()}.${ext}`;
        thumbnailUrl = await uploadCourseAsset(
          values.thumbnailFile,
          "course-assets",
          fileName
        );
      }

      let avatarUrl = null;
      if (values.avatarFile) {
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

      const contentJson = {
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

      const metadataJson = {
        tags: [],
        stats: { rating: 5.0, reviews: 0, students: 0 },
        features: ["Akses 12 bulan", "Update materi gratis"],
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

        content: contentJson,
        metadata: metadataJson,

        lessons_count: 1,
        is_published: true,
        display_order: 99,
      };

      // Panggil createCourse (Hapus parameter video_id yg tidak perlu)
      const result = await createCourse(payload);

      if (result.error) {
        toast.error("Gagal membuat kursus", {
          description: result.error,
        });
        return;
      }

      toast.success("Kursus berhasil dibuat!");
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
      <CourseForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
