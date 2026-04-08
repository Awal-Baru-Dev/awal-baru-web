-- Recreate admin_profiles_view to include whatsapp_number and updated_at
DROP VIEW IF EXISTS "public"."admin_profiles_view";

CREATE OR REPLACE VIEW "public"."admin_profiles_view" AS
 SELECT "p"."id",
    "p"."full_name",
    "p"."avatar_url",
    "p"."whatsapp_number",
    "p"."role",
    "p"."created_at",
    "p"."updated_at",
    "u"."email"
   FROM ("public"."profiles" "p"
     JOIN "auth"."users" "u" ON (("p"."id" = "u"."id")));

-- Set owner and permissions
ALTER VIEW "public"."admin_profiles_view" OWNER TO "postgres";
GRANT ALL ON TABLE "public"."admin_profiles_view" TO "anon";
GRANT ALL ON TABLE "public"."admin_profiles_view" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_profiles_view" TO "service_role";
