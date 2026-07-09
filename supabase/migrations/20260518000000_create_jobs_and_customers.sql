-- Customers table
CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "area" "text",
    "default_duration" integer DEFAULT 30,
    "address" "text",
    "lat" double precision,
    "lng" double precision,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."customers" OWNER TO "postgres";

ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");

CREATE INDEX "idx_customers_area" ON "public"."customers" USING "btree" ("area");

GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";


-- Jobs table
CREATE TABLE IF NOT EXISTS "public"."jobs" (
    "id" "text" NOT NULL,
    "job_title" "text",
    "driver_id" "text",
    "start_time" "text",
    "duration_minutes" integer DEFAULT 15 NOT NULL,
    "bucket_type" "text",
    "customer_id" "text",
    "required_vehicle" "text",
    "area" "text",
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "driver_name" "text",
    "vehicle_name" "text",
    "customer_name" "text",
    "item_category" "text",
    "weight_kg" numeric,
    "special_notes" "text",
    "is_synced_to_sheet" boolean DEFAULT false,
    "work_type" "text" DEFAULT '袋'::"text",
    "task_details" "jsonb",
    "is_spot" boolean DEFAULT false,
    "time_constraint" "jsonb",
    "task_type" "text" DEFAULT '袋'::"text",
    "vehicle_lock" "text"
);

ALTER TABLE "public"."jobs" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."jobs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "public"."jobs_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."jobs_id_seq" OWNED BY "public"."jobs"."id";

ALTER TABLE ONLY "public"."jobs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."jobs_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_pkey" PRIMARY KEY ("id");

CREATE INDEX "idx_jobs_is_spot" ON "public"."jobs" USING "btree" ("is_spot") WHERE ("is_spot" = true);
CREATE INDEX "idx_jobs_task_type" ON "public"."jobs" USING "btree" ("task_type");
CREATE INDEX "idx_jobs_time_constraint" ON "public"."jobs" USING "gin" ("time_constraint") WHERE ("time_constraint" IS NOT NULL);

GRANT ALL ON TABLE "public"."jobs" TO "anon";
GRANT ALL ON TABLE "public"."jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."jobs" TO "service_role";

GRANT ALL ON SEQUENCE "public"."jobs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."jobs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."jobs_id_seq" TO "service_role";
