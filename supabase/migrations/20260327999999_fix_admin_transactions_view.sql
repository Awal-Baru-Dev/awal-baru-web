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
    "c"."title" AS "course_title",
    "c"."thumbnail_url" AS "course_thumbnail",
    "e"."expires_at"
   FROM ((("public"."enrollments" "e"
     JOIN "public"."profiles" "p" ON (("e"."user_id" = "p"."id")))
     JOIN "auth"."users" "u" ON (("e"."user_id" = "u"."id")))
     JOIN "public"."courses" "c" ON (("e"."course_id" = "c"."id")));

CREATE OR REPLACE VIEW "public"."admin_course_list_view" AS
 SELECT "c"."id",
    "c"."title",
    "c"."slug",
    "c"."thumbnail_url",
    "c"."category",
    "c"."instructor_name",
    "c"."price",
    "c"."is_published",
    "c"."created_at",
    "c"."updated_at",
    "c"."display_order",
    COALESCE("count"(DISTINCT "e"."user_id"), (0)::bigint) AS "student_count",
    COALESCE("count"(DISTINCT "e"."payment_reference"), (0)::bigint) AS "sales_count"
   FROM ("public"."courses" "c"
     -- Added payment_status = 'paid' to properly filter out pending enrollments from the aggregate counts
     LEFT JOIN "public"."enrollments" "e" ON (
       (
         ("c"."id" = "e"."course_id") OR 
         (("c"."id" = '1e31bf60-3c80-4c20-8b45-4deca48a7570'::"uuid") AND (("e"."payment_reference")::"text" ~~ 'INV-BUNDLE%'::"text"))
       ) 
       AND "e"."payment_status" = 'paid'::"public"."payment_status"
     )
   )
  GROUP BY "c"."id";
