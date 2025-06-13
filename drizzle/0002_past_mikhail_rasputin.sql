CREATE TABLE "models" (
	"id" varchar(255) NOT NULL,
	"name" varchar(255),
	"info" text,
	"context_length" integer NOT NULL,
	"premium" boolean
);
--> statement-breakpoint
CREATE TABLE "providers" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "models" ADD CONSTRAINT "models_id_providers_id_fk" FOREIGN KEY ("id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;