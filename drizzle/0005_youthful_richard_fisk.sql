CREATE TABLE "models_tools" (
	"model_id" varchar(255) NOT NULL,
	"tool_id" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tools" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text
);
