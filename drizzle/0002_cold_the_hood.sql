CREATE TABLE `chat_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`chat_id` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`last_message` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chat_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `chat_sessions_chat_id_unique` UNIQUE(`chat_id`)
);
--> statement-breakpoint
ALTER TABLE `diagnostic_snapshots` MODIFY COLUMN `s` decimal(5,2);--> statement-breakpoint
ALTER TABLE `diagnostic_snapshots` MODIFY COLUMN `vS` decimal(5,2);--> statement-breakpoint
ALTER TABLE `diagnostic_snapshots` MODIFY COLUMN `aS` decimal(5,2);--> statement-breakpoint
ALTER TABLE `diagnostic_snapshots` MODIFY COLUMN `iFund` decimal(5,2);--> statement-breakpoint
ALTER TABLE `diagnostic_snapshots` MODIFY COLUMN `iMarketGap` decimal(5,2);--> statement-breakpoint
ALTER TABLE `diagnostic_snapshots` MODIFY COLUMN `iStruct` decimal(5,2);--> statement-breakpoint
ALTER TABLE `diagnostic_snapshots` MODIFY COLUMN `iVola` decimal(5,2);--> statement-breakpoint
ALTER TABLE `phase_context` MODIFY COLUMN `s` decimal(5,2);--> statement-breakpoint
ALTER TABLE `phase_context` MODIFY COLUMN `vS` decimal(5,2);--> statement-breakpoint
ALTER TABLE `phase_context` MODIFY COLUMN `aS` decimal(5,2);--> statement-breakpoint
ALTER TABLE `phase_context` MODIFY COLUMN `iFund` decimal(5,2);--> statement-breakpoint
ALTER TABLE `phase_context` MODIFY COLUMN `iMarketGap` decimal(5,2);--> statement-breakpoint
ALTER TABLE `phase_context` MODIFY COLUMN `iStruct` decimal(5,2);--> statement-breakpoint
ALTER TABLE `phase_context` MODIFY COLUMN `iVola` decimal(5,2);