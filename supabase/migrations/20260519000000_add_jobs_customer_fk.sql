-- 既存の同名制約が存在する場合は一旦安全に削除し、再度作成することで冪等性を担保します
ALTER TABLE ONLY "public"."jobs" 
    DROP CONSTRAINT IF EXISTS "jobs_customer_id_fkey";

ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_customer_id_fkey" 
    FOREIGN KEY ("customer_id") 
    REFERENCES "public"."customers"("id") 
    ON DELETE SET NULL;
