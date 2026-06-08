ALTER TABLE `readings` ADD `strip_model_id` text;--> statement-breakpoint
ALTER TABLE `readings` ADD `pads_json` text DEFAULT '[]' NOT NULL;