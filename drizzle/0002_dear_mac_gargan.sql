ALTER TABLE `reminders` ADD `hour` integer DEFAULT 8 NOT NULL;--> statement-breakpoint
ALTER TABLE `reminders` ADD `minute` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `reminders` ADD `notif_ids` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `reminders` ADD `created_at` integer DEFAULT 0 NOT NULL;