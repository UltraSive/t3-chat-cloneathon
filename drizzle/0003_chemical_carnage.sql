ALTER TABLE "providers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "providers" CASCADE;--> statement-breakpoint
ALTER TABLE "models" DROP CONSTRAINT "models_id_providers_id_fk";
--> statement-breakpoint
ALTER TABLE "models" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "models" ADD COLUMN "provider" varchar(255) NOT NULL;