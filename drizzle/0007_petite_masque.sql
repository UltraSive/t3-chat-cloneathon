ALTER TABLE "users" ADD COLUMN "occupation" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "traits" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "additional_info" varchar(3000);