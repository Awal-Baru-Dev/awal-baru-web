


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."notification_type" AS ENUM (
    'course',
    'achievement',
    'community',
    'system',
    'payment'
);


ALTER TYPE "public"."notification_type" OWNER TO "postgres";


CREATE TYPE "public"."payment_method" AS ENUM (
    'virtual_account',
    'credit_card',
    'e_wallet',
    'qris',
    'retail',
    'direct_debit',
    'paylater'
);


ALTER TYPE "public"."payment_method" OWNER TO "postgres";


CREATE TYPE "public"."payment_status" AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded',
    'expired'
);


ALTER TYPE "public"."payment_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_admin_dashboard_stats"() RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  total_rev BIGINT;
  total_usr INTEGER;
  active_crs INTEGER;
  sales_24h INTEGER;
  daily_stats json;
BEGIN
  -- 1. Total Revenue
  SELECT COALESCE(SUM(amount_paid), 0) INTO total_rev
  FROM enrollments
  WHERE payment_status = 'paid';

  -- 2. Total User
  SELECT COUNT(*) INTO total_usr
  FROM profiles
  WHERE role = 'user';

  -- 3. Kursus Aktif
  SELECT COUNT(*) INTO active_crs
  FROM courses
  WHERE is_published = true;

  -- 4. Penjualan 24 Jam
  SELECT COUNT(*) INTO sales_24h
  FROM enrollments
  WHERE payment_status = 'paid' 
  AND created_at >= NOW() - INTERVAL '24 hours';

  -- 5. (FIX) Grafik Pendapatan 7 Hari Terakhir
  -- Menggunakan generate_series agar hari yang kosong tetap muncul sebagai 0
  SELECT json_agg(
    json_build_object(
      'date', to_char(days.day, 'DD Mon'),
      'total', COALESCE(daily_sales.total_amount, 0)
    ) ORDER BY days.day
  ) INTO daily_stats
  FROM (
    -- Generate 7 hari terakhir (dari H-6 sampai Hari Ini)
    SELECT generate_series(
      date_trunc('day', NOW() - INTERVAL '6 days'),
      date_trunc('day', NOW()),
      '1 day'::interval
    ) as day
  ) days
  LEFT JOIN (
    -- Join dengan data penjualan
    SELECT 
      date_trunc('day', created_at) as sale_day,
      SUM(amount_paid) as total_amount
    FROM enrollments
    WHERE payment_status = 'paid'
      AND created_at >= (NOW() - INTERVAL '7 days')
    GROUP BY 1
  ) daily_sales ON days.day = daily_sales.sale_day;

  RETURN json_build_object(
    'totalRevenue', total_rev,
    'totalUsers', total_usr,
    'activeCourses', active_crs,
    'sales24h', sales_24h,
    'revenueChart', COALESCE(daily_stats, '[]'::json)
  );
END;
$$;


ALTER FUNCTION "public"."get_admin_dashboard_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."activity_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "course_id" "uuid" NOT NULL,
    "activity_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "lessons_completed" integer DEFAULT 0,
    "time_spent_minutes" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."activity_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."activity_log" IS 'Tracks daily user activity for dashboard stats';



COMMENT ON COLUMN "public"."activity_log"."activity_date" IS 'Date of activity (aggregated by day)';



COMMENT ON COLUMN "public"."activity_log"."lessons_completed" IS 'Number of lessons completed on this day';



COMMENT ON COLUMN "public"."activity_log"."time_spent_minutes" IS 'Total time spent watching videos on this day';



CREATE OR REPLACE VIEW "public"."admin_course_list_view" AS
SELECT
    NULL::"uuid" AS "id",
    NULL::character varying(255) AS "title",
    NULL::character varying(255) AS "slug",
    NULL::character varying(500) AS "thumbnail_url",
    NULL::character varying(255) AS "category",
    NULL::character varying(255) AS "instructor_name",
    NULL::integer AS "price",
    NULL::boolean AS "is_published",
    NULL::timestamp with time zone AS "created_at",
    NULL::timestamp with time zone AS "updated_at",
    NULL::integer AS "display_order",
    NULL::bigint AS "student_count",
    NULL::bigint AS "sales_count";


ALTER VIEW "public"."admin_course_list_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" character varying(255),
    "avatar_url" character varying(500),
    "phone" character varying(50),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'user'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."admin_profiles_view" AS
 SELECT "p"."id",
    "p"."full_name",
    "p"."avatar_url",
    "p"."phone",
    "p"."role",
    "p"."created_at",
    "u"."email"
   FROM ("public"."profiles" "p"
     JOIN "auth"."users" "u" ON (("p"."id" = "u"."id")));


ALTER VIEW "public"."admin_profiles_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" character varying(255) NOT NULL,
    "title" character varying(255) NOT NULL,
    "short_description" character varying(500),
    "price" integer DEFAULT 0 NOT NULL,
    "original_price" integer,
    "thumbnail_url" character varying(500),
    "preview_video_url" character varying(500),
    "instructor_name" character varying(255),
    "instructor_title" character varying(255),
    "instructor_avatar" character varying(500),
    "level" character varying(50) DEFAULT 'Pemula'::character varying,
    "category" character varying(255),
    "duration_minutes" integer DEFAULT 0,
    "lessons_count" integer DEFAULT 0,
    "is_published" boolean DEFAULT false,
    "is_featured" boolean DEFAULT false,
    "display_order" integer DEFAULT 0,
    "content" "jsonb" DEFAULT '{}'::"jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "description_for_enrolled" "text"
);


ALTER TABLE "public"."courses" OWNER TO "postgres";


COMMENT ON TABLE "public"."courses" IS 'Stores course information with hybrid schema';



COMMENT ON COLUMN "public"."courses"."content" IS 'JSONB storing sections and lessons structure';



COMMENT ON COLUMN "public"."courses"."metadata" IS 'JSONB storing whatYouWillLearn, features, tags, stats';



CREATE TABLE IF NOT EXISTS "public"."enrollments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "course_id" "uuid" NOT NULL,
    "payment_status" "public"."payment_status" DEFAULT 'pending'::"public"."payment_status",
    "payment_method" "public"."payment_method",
    "payment_reference" character varying(255),
    "payment_channel" character varying(100),
    "amount_paid" integer DEFAULT 0,
    "purchased_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."enrollments" OWNER TO "postgres";


COMMENT ON TABLE "public"."enrollments" IS 'Tracks user course enrollments and payment status';



COMMENT ON COLUMN "public"."enrollments"."payment_reference" IS 'DOKU invoice number or transaction ID';



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
    "c"."thumbnail_url" AS "course_thumbnail"
   FROM ((("public"."enrollments" "e"
     JOIN "public"."profiles" "p" ON (("e"."user_id" = "p"."id")))
     JOIN "auth"."users" "u" ON (("e"."user_id" = "u"."id")))
     JOIN "public"."courses" "c" ON (("e"."course_id" = "c"."id")));


ALTER VIEW "public"."admin_transactions_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."course_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "course_id" "uuid" NOT NULL,
    "current_section_id" character varying(10) NOT NULL,
    "current_lesson_index" integer NOT NULL,
    "progress_percent" integer DEFAULT 0,
    "last_accessed_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "last_watched_seconds" integer DEFAULT 0,
    CONSTRAINT "course_progress_progress_percent_check" CHECK ((("progress_percent" >= 0) AND ("progress_percent" <= 100)))
);


ALTER TABLE "public"."course_progress" OWNER TO "postgres";


COMMENT ON TABLE "public"."course_progress" IS 'Tracks user progress through courses (MVP: position-based)';



COMMENT ON COLUMN "public"."course_progress"."current_section_id" IS 'Maps to content.sections[].id in courses table';



COMMENT ON COLUMN "public"."course_progress"."current_lesson_index" IS '0-based index within content.sections[].lessons[]';



COMMENT ON COLUMN "public"."course_progress"."progress_percent" IS 'Overall progress 0-100, derived from current position / total lessons';



CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "public"."notification_type" DEFAULT 'system'::"public"."notification_type" NOT NULL,
    "title" character varying(255) NOT NULL,
    "message" "text" NOT NULL,
    "link" character varying(500),
    "is_read" boolean DEFAULT false,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


COMMENT ON TABLE "public"."notifications" IS 'Stores user notifications for various events';



COMMENT ON COLUMN "public"."notifications"."metadata" IS 'JSONB for additional context like course_id, invoice_number';



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."course_progress"
    ADD CONSTRAINT "course_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."enrollments"
    ADD CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."enrollments"
    ADD CONSTRAINT "unique_user_course" UNIQUE ("user_id", "course_id");



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "unique_user_course_date" UNIQUE ("user_id", "course_id", "activity_date");



ALTER TABLE ONLY "public"."course_progress"
    ADD CONSTRAINT "unique_user_course_progress" UNIQUE ("user_id", "course_id");



CREATE INDEX "idx_activity_log_user_course_date" ON "public"."activity_log" USING "btree" ("user_id", "course_id", "activity_date");



CREATE INDEX "idx_activity_log_user_date" ON "public"."activity_log" USING "btree" ("user_id", "activity_date" DESC);



CREATE INDEX "idx_activity_log_user_id" ON "public"."activity_log" USING "btree" ("user_id");



CREATE INDEX "idx_course_progress_course_id" ON "public"."course_progress" USING "btree" ("course_id");



CREATE INDEX "idx_course_progress_last_accessed" ON "public"."course_progress" USING "btree" ("last_accessed_at" DESC);



CREATE INDEX "idx_course_progress_user_course" ON "public"."course_progress" USING "btree" ("user_id", "course_id");



CREATE INDEX "idx_course_progress_user_id" ON "public"."course_progress" USING "btree" ("user_id");



CREATE INDEX "idx_courses_category" ON "public"."courses" USING "btree" ("category");



CREATE INDEX "idx_courses_display_order" ON "public"."courses" USING "btree" ("display_order");



CREATE INDEX "idx_courses_is_featured" ON "public"."courses" USING "btree" ("is_featured");



CREATE INDEX "idx_courses_is_published" ON "public"."courses" USING "btree" ("is_published");



CREATE INDEX "idx_courses_metadata" ON "public"."courses" USING "gin" ("metadata");



CREATE INDEX "idx_courses_slug" ON "public"."courses" USING "btree" ("slug");



CREATE INDEX "idx_enrollments_course_id" ON "public"."enrollments" USING "btree" ("course_id");



CREATE INDEX "idx_enrollments_payment_reference" ON "public"."enrollments" USING "btree" ("payment_reference");



CREATE INDEX "idx_enrollments_payment_status" ON "public"."enrollments" USING "btree" ("payment_status");



CREATE INDEX "idx_enrollments_user_id" ON "public"."enrollments" USING "btree" ("user_id");



CREATE INDEX "idx_notifications_created_at" ON "public"."notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_notifications_is_read" ON "public"."notifications" USING "btree" ("is_read");



CREATE INDEX "idx_notifications_type" ON "public"."notifications" USING "btree" ("type");



CREATE INDEX "idx_notifications_user_id" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_profiles_id" ON "public"."profiles" USING "btree" ("id");



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
     LEFT JOIN "public"."enrollments" "e" ON ((("c"."id" = "e"."course_id") OR (("c"."id" = '1e31bf60-3c80-4c20-8b45-4deca48a7570'::"uuid") AND (("e"."payment_reference")::"text" ~~ 'INV-BUNDLE%'::"text")))))
  GROUP BY "c"."id";



CREATE OR REPLACE TRIGGER "on_activity_log_updated" BEFORE UPDATE ON "public"."activity_log" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_course_progress_updated" BEFORE UPDATE ON "public"."course_progress" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_courses_updated" BEFORE UPDATE ON "public"."courses" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_enrollments_updated" BEFORE UPDATE ON "public"."enrollments" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_profiles_updated" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_progress"
    ADD CONSTRAINT "course_progress_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_progress"
    ADD CONSTRAINT "course_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."enrollments"
    ADD CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."enrollments"
    ADD CONSTRAINT "enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Only Admins can delete courses" ON "public"."courses" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Only Admins can insert courses" ON "public"."courses" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Only Admins can update courses" ON "public"."courses" FOR UPDATE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Public read published, Admins read all" ON "public"."courses" FOR SELECT USING ((("is_published" = true) OR (("auth"."role"() = 'authenticated'::"text") AND "public"."is_admin"())));



CREATE POLICY "Service role has full access to activity_log" ON "public"."activity_log" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role has full access to course_progress" ON "public"."course_progress" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role has full access to enrollments" ON "public"."enrollments" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role has full access to notifications" ON "public"."notifications" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Users can delete own course progress" ON "public"."course_progress" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own notifications" ON "public"."notifications" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own activity log" ON "public"."activity_log" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own course progress" ON "public"."course_progress" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own enrollments" ON "public"."enrollments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own notifications" ON "public"."notifications" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own activity log" ON "public"."activity_log" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own course progress" ON "public"."course_progress" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own enrollments" ON "public"."enrollments" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own notifications" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own activity log" ON "public"."activity_log" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own course progress" ON "public"."course_progress" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own enrollments" ON "public"."enrollments" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own notifications" ON "public"."notifications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users see own, Admins see all" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "id") OR "public"."is_admin"()));



CREATE POLICY "Users update own, Admins update all" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "id") OR "public"."is_admin"()));



ALTER TABLE "public"."activity_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."course_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."enrollments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."get_admin_dashboard_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_admin_dashboard_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_admin_dashboard_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";


















GRANT ALL ON TABLE "public"."activity_log" TO "anon";
GRANT ALL ON TABLE "public"."activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_log" TO "service_role";



GRANT ALL ON TABLE "public"."admin_course_list_view" TO "anon";
GRANT ALL ON TABLE "public"."admin_course_list_view" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_course_list_view" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."admin_profiles_view" TO "anon";
GRANT ALL ON TABLE "public"."admin_profiles_view" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_profiles_view" TO "service_role";



GRANT ALL ON TABLE "public"."courses" TO "anon";
GRANT ALL ON TABLE "public"."courses" TO "authenticated";
GRANT ALL ON TABLE "public"."courses" TO "service_role";



GRANT ALL ON TABLE "public"."enrollments" TO "anon";
GRANT ALL ON TABLE "public"."enrollments" TO "authenticated";
GRANT ALL ON TABLE "public"."enrollments" TO "service_role";



GRANT ALL ON TABLE "public"."admin_transactions_view" TO "anon";
GRANT ALL ON TABLE "public"."admin_transactions_view" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_transactions_view" TO "service_role";



GRANT ALL ON TABLE "public"."course_progress" TO "anon";
GRANT ALL ON TABLE "public"."course_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."course_progress" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Admin Upload 1wjld9x_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'course-assets'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Admin Upload 1wjld9x_1"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'course-assets'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Admin Upload 1wjld9x_2"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'course-assets'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Admin Upload 1wjld9x_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'course-assets'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Admin Upload Avatars 1oj01fe_0"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'avatars'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Admin Upload Avatars 1oj01fe_1"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'avatars'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Admin Upload Avatars 1oj01fe_2"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'avatars'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Admin Upload Avatars 1oj01fe_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'avatars'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Public can read avatars"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'avatars'::text));



  create policy "Public can read course assets"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'course-assets'::text));



  create policy "Service role can manage course assets"
  on "storage"."objects"
  as permissive
  for all
  to public
using (((bucket_id = 'course-assets'::text) AND (auth.role() = 'service_role'::text)));



  create policy "Users can delete own avatar"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can update own avatar"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can upload own avatar"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



