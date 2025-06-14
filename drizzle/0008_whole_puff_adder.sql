ALTER TABLE "models" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "models" ADD COLUMN "type" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "nickname" varchar(255);