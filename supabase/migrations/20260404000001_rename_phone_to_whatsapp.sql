-- Rename phone column to whatsapp_number
ALTER TABLE public.profiles RENAME COLUMN phone TO whatsapp_number;

-- Recreate admin_transactions_view to include whatsapp_number
DROP VIEW IF EXISTS "public"."admin_transactions_view";

CREATE OR REPLACE VIEW "public"."admin_transactions_view" AS
 SELECT "e"."id",
    "e"."created_at",
    "e"."payment_status",
    "e"."amount_paid",
    "e"."payment_method",
    "e"."payment_channel",
    "e"."payment_reference",
    "p"."full_name" AS "user_name",
    "u"."email" AS "user_email",
    "p"."avatar_url" AS "user_avatar",
    "p"."whatsapp_number" AS "user_whatsapp",
    "c"."title" AS "course_title",
    "c"."thumbnail_url" AS "course_thumbnail",
    "e"."expires_at"
   FROM ((("public"."enrollments" "e"
     JOIN "public"."profiles" "p" ON (("e"."user_id" = "p"."id")))
     JOIN "auth"."users" "u" ON (("e"."user_id" = "u"."id")))
     JOIN "public"."courses" "c" ON (("e"."course_id" = "c"."id")));
