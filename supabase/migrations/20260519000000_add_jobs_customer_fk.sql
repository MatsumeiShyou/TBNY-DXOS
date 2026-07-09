alter table "public"."jobs" add constraint "jobs_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL not valid;

alter table "public"."jobs" validate constraint "jobs_customer_id_fkey";


