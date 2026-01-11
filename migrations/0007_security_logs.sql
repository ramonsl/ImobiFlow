CREATE TABLE "security_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"user_id" text,
	"event" text NOT NULL,
	"details" text,
	"ip" text,
	"user_agent" text,
	"path" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "security_logs" ADD CONSTRAINT "security_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_logs" ADD CONSTRAINT "security_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;