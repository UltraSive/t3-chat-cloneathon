CREATE TABLE "oauth_account" (
	"provider_id" varchar(255) NOT NULL,
	"provider_user_id" varchar(255) NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "oauth_account_provider_id_provider_user_id_pk" PRIMARY KEY("provider_id","provider_user_id")
);
--> statement-breakpoint
ALTER TABLE "oauth_account" ADD CONSTRAINT "oauth_account_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "oauth_account_user_idx" ON "oauth_account" USING btree ("user_id");