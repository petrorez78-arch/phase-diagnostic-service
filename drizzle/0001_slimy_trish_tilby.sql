CREATE TABLE `chat_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`chat_id` varchar(64) NOT NULL,
	`ticker` varchar(20) NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `diagnostic_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`ticker` varchar(20) NOT NULL,
	`company` varchar(255) NOT NULL,
	`phase` varchar(50),
	`s` int,
	`vS` int,
	`aS` int,
	`iFund` int,
	`iMarketGap` int,
	`iStruct` int,
	`iVola` int,
	`signals` text,
	`last_price` int,
	`vol_today` int,
	`num_trades` int,
	`capitalization` int,
	`news_context` text,
	`ai_interpretation` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `diagnostic_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `phase_context` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`chat_id` varchar(64) NOT NULL,
	`ticker` varchar(20) NOT NULL,
	`company` varchar(255) NOT NULL,
	`phase` varchar(50),
	`s` int,
	`vS` int,
	`aS` int,
	`iFund` int,
	`iMarketGap` int,
	`iStruct` int,
	`iVola` int,
	`signals` text,
	`last_price` int,
	`vol_today` int,
	`num_trades` int,
	`capitalization` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `phase_context_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stock_searches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`query` varchar(255) NOT NULL,
	`ticker` varchar(20),
	`company` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stock_searches_id` PRIMARY KEY(`id`)
);
