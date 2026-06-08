CREATE TABLE `app_config` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `readings` (
	`id` text PRIMARY KEY NOT NULL,
	`sample_id` text NOT NULL,
	`ph` real NOT NULL,
	`ts` integer NOT NULL,
	`confidence` real DEFAULT 0.9 NOT NULL,
	`photos_json` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_readings_sample` ON `readings` (`sample_id`);--> statement-breakpoint
CREATE INDEX `idx_readings_ts` ON `readings` (`ts`);--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` text PRIMARY KEY NOT NULL,
	`sample_id` text NOT NULL,
	`label` text NOT NULL,
	`time` text DEFAULT '' NOT NULL,
	`repeat` text DEFAULT '' NOT NULL,
	`enabled` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `samples` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`sub` text DEFAULT '' NOT NULL,
	`use_case` text NOT NULL,
	`icon` text NOT NULL,
	`color` text DEFAULT '#5DBE6E' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_samples_usecase` ON `samples` (`use_case`);