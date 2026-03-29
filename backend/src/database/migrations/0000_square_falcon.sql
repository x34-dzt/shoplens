CREATE TYPE "public"."event_type" AS ENUM('page_view', 'add_to_cart', 'remove_from_cart', 'checkout_started', 'purchase');--> statement-breakpoint
CREATE TABLE "events" (
	"event_id" varchar(34) PRIMARY KEY NOT NULL,
	"store_id" varchar(34) NOT NULL,
	"event_type" "event_type" NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_daily_summary" (
	"store_id" varchar(34) NOT NULL,
	"date" date NOT NULL,
	"total_revenue" numeric(12, 2) DEFAULT '0',
	"page_views" bigint DEFAULT 0,
	"add_to_carts" bigint DEFAULT 0,
	"checkouts_started" bigint DEFAULT 0,
	"purchases" bigint DEFAULT 0,
	CONSTRAINT "store_daily_summary_store_id_date_pk" PRIMARY KEY("store_id","date")
);
--> statement-breakpoint
CREATE TABLE "store_product_summary" (
	"store_id" varchar(34) NOT NULL,
	"product_id" varchar(34) NOT NULL,
	"total_revenue" numeric(12, 2) DEFAULT '0',
	"total_orders" bigint DEFAULT 0,
	CONSTRAINT "store_product_summary_store_id_product_id_pk" PRIMARY KEY("store_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" varchar(34) PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"name" varchar(50) NOT NULL,
	"user_id" varchar(34) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(34) PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"username" varchar(50) NOT NULL,
	"password" varchar(255) NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_daily_summary" ADD CONSTRAINT "store_daily_summary_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_product_summary" ADD CONSTRAINT "store_product_summary_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "events_store_id_timestamp_index" ON "events" USING btree ("store_id","timestamp");--> statement-breakpoint
CREATE INDEX "events_store_id_event_type_timestamp_index" ON "events" USING btree ("store_id","event_type","timestamp");--> statement-breakpoint
CREATE INDEX "store_daily_summary_store_id_date_index" ON "store_daily_summary" USING btree ("store_id","date");--> statement-breakpoint
CREATE INDEX "store_product_summary_store_id_total_revenue_index" ON "store_product_summary" USING btree ("store_id","total_revenue");--> statement-breakpoint
CREATE INDEX "stores_user_id_index" ON "stores" USING btree ("user_id");