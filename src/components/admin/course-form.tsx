import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Plus, Trash2, UploadCloud } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter"),
  slug: z
    .string()
    .min(5, "Slug minimal 5 karakter")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug harus lowercase dan pakai dash (-)"
    ),
  price: z.coerce.number().min(0),
  original_price: z.coerce.number().optional(),

  duration_minutes: z.coerce.number().min(0, "Durasi wajib diisi").default(0),

  category: z.string().min(1, "Pilih kategori"),
  level: z.string().default("Pemula"),
  short_description: z.string().optional(),

  instructor_name: z.string().min(1, "Nama instruktur wajib diisi"),
  instructor_title: z.string().optional(),

  preview_video_url: z.string().optional(),
  video_id: z.string().optional(),

  what_you_will_learn: z.array(z.object({ value: z.string() })).optional(),

  thumbnailFile: z.any().optional(),
  avatarFile: z.any().optional(),
});

export type CourseFormValues = z.infer<typeof formSchema>;

interface CourseFormProps {
	initialData?: any;
	onSubmit: (values: CourseFormValues) => void;
	isLoading?: boolean;
}

export function CourseForm({
	initialData,
	onSubmit,
	isLoading,
}: CourseFormProps) {
	const form = useForm<CourseFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: initialData || {
      title: "",
      slug: "",
      price: 0,
      original_price: 0,
      duration_minutes: 0,
      category: "",
      level: "Pemula",
      short_description: "",
      instructor_name: "",
      instructor_title: "",
      preview_video_url: "",
      video_id: "",
      what_you_will_learn: [{ value: "" }, { value: "" }],
    },
  });

    const {
      fields: learnFields,
      append: appendLearn,
      remove: removeLearn,
    } = useFieldArray({
      control: form.control,
      name: "what_you_will_learn" as any,
    });

    const [thumbPreview, setThumbPreview] = useState<string | null>(initialData?.thumbnail_url || null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.instructor_avatar || null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "thumbnailFile" | "avatarFile", setPreview: (url: string) => void) => {
      const file = e.target.files?.[0];
      if (file) {
        form.setValue(fieldName, file);
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
      }
    };

	return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            {initialData ? "Edit Kursus" : "Buat Kursus Baru"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Isi detail kursus, upload materi, dan atur harga.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/admin/courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Batal
          </Link>
        </Button>
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Informasi Dasar</h3>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul Kursus</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: Tourist Visa (B-2)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (URL)</FormLabel>
                    <FormControl>
                      <Input placeholder="tourist-visa-b2" {...field} />
                    </FormControl>
                    <FormDescription>
                      awlbaru.com/courses/<b>{field.value || "..."}</b>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Visa & Travel">
                            Visa & Travel
                          </SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Work">Work</SelectItem>
                          <SelectItem value="General">General</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pemula">Pemula</SelectItem>
                          <SelectItem value="Menengah">Menengah</SelectItem>
                          <SelectItem value="Lanjut">Lanjut</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="short_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi Singkat</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Jelaskan isi kursus..."
                        className="h-[120px]"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Media & Harga</h3>

              <FormItem>
                <FormLabel>Thumbnail Kursus (1:1 Recommended)</FormLabel>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-muted rounded-md border flex items-center justify-center overflow-hidden relative">
                    {thumbPreview ? (
                      <img
                        src={thumbPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UploadCloud className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileChange(e, "thumbnailFile", setThumbPreview)
                      }
                    />
                  </div>
                </div>
              </FormItem>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga Jual (IDR)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="original_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga Coret (Opsional)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* --- 2. TAMBAHKAN INPUT MANUAL DURASI DI SINI --- */}
              <FormField
                control={form.control}
                name="duration_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durasi (Menit)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Contoh: 60"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="preview_video_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video Trailer ID (Bunny.net)</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: mtakj95z0k" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Profil Instruktur</h3>

              <div className="flex gap-4 items-start">
                <div className="w-16 h-16 rounded-full bg-muted border flex items-center justify-center overflow-hidden flex-shrink-0">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UploadCloud className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <FormItem>
                    <FormLabel>Foto Profil</FormLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileChange(e, "avatarFile", setAvatarPreview)
                      }
                    />
                  </FormItem>
                  <FormField
                    control={form.control}
                    name="instructor_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Nama Instruktur" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="instructor_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Title / Jabatan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Materi Kursus</h3>

              <FormField
                control={form.control}
                name="video_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Video ID (Bunny.net)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ID Video Utama (Full Course)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Masukkan ID video dari Bunny Stream.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel className="mb-2 block">
                  Apa yang akan dipelajari?
                </FormLabel>
                <div className="space-y-2">
                  {learnFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <Input
                        {...form.register(
                          `what_you_will_learn.${index}.value` as const
                        )}
                        placeholder={`Poin ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLearn(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendLearn({ value: "" })}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Tambah Poin
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="w-full md:w-auto bg-brand-primary"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan & Publish Kursus
          </Button>
        </form>
      </Form>
    </div>
  );
}