CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorUserId` int NOT NULL,
	`action` varchar(120) NOT NULL,
	`entityType` varchar(80) NOT NULL,
	`entityId` varchar(80) NOT NULL,
	`metadata` json,
	`requestId` varchar(96),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `donations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`programId` int,
	`amountPaise` bigint NOT NULL,
	`source` enum('offline','razorpay') NOT NULL,
	`status` enum('pending','successful','failed','reversed') NOT NULL DEFAULT 'pending',
	`paymentMode` enum('cash','cheque','upi','card','netbanking'),
	`razorpayOrderId` varchar(128),
	`razorpayPaymentId` varchar(128),
	`providerEventId` varchar(128),
	`idempotencyKey` varchar(128),
	`notes` text,
	`enteredByUserId` int,
	`receivedAt` datetime,
	`succeededAt` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `donations_id` PRIMARY KEY(`id`),
	CONSTRAINT `donations_provider_event_unique` UNIQUE(`providerEventId`),
	CONSTRAINT `donations_idempotency_unique` UNIQUE(`idempotencyKey`)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`programId` int,
	`amountPaise` bigint NOT NULL,
	`category` enum('coaching','library','kanyadan','operations','other') NOT NULL,
	`publicDescription` varchar(500) NOT NULL,
	`privateNotes` text,
	`receiptObjectKey` varchar(512),
	`enteredByUserId` int NOT NULL,
	`spentAt` datetime NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feature_flags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(80) NOT NULL,
	`enabled` boolean NOT NULL DEFAULT false,
	`updatedByUserId` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feature_flags_id` PRIMARY KEY(`id`),
	CONSTRAINT `feature_flags_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fullName` varchar(200) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`email` varchar(320),
	`dateOfBirth` date NOT NULL,
	`villageWard` varchar(200) NOT NULL,
	`publicDisplayName` varchar(120),
	`isAnonymous` boolean NOT NULL DEFAULT true,
	`verificationTier` enum('registered','voter_verified') NOT NULL DEFAULT 'registered',
	`accountStatus` enum('active','suspended') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `members_id` PRIMARY KEY(`id`),
	CONSTRAINT `members_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `members_phone_unique` UNIQUE(`phone`)
);
--> statement-breakpoint
CREATE TABLE `programs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(120) NOT NULL,
	`name` varchar(180) NOT NULL,
	`shortDescription` varchar(280) NOT NULL,
	`description` text NOT NULL,
	`targetMetric` varchar(120),
	`currentMetricValue` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `programs_id` PRIMARY KEY(`id`),
	CONSTRAINT `programs_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actorUserId_users_id_fk` FOREIGN KEY (`actorUserId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `donations` ADD CONSTRAINT `donations_memberId_members_id_fk` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `donations` ADD CONSTRAINT `donations_programId_programs_id_fk` FOREIGN KEY (`programId`) REFERENCES `programs`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `donations` ADD CONSTRAINT `donations_enteredByUserId_users_id_fk` FOREIGN KEY (`enteredByUserId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_programId_programs_id_fk` FOREIGN KEY (`programId`) REFERENCES `programs`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_enteredByUserId_users_id_fk` FOREIGN KEY (`enteredByUserId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `feature_flags` ADD CONSTRAINT `feature_flags_updatedByUserId_users_id_fk` FOREIGN KEY (`updatedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `members` ADD CONSTRAINT `members_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `audit_entity_created_idx` ON `audit_logs` (`entityType`,`entityId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `audit_actor_created_idx` ON `audit_logs` (`actorUserId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `donations_status_created_idx` ON `donations` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `donations_member_created_idx` ON `donations` (`memberId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `donations_program_created_idx` ON `donations` (`programId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `expenses_spent_created_idx` ON `expenses` (`spentAt`,`createdAt`);--> statement-breakpoint
CREATE INDEX `expenses_program_created_idx` ON `expenses` (`programId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `members_village_ward_idx` ON `members` (`villageWard`);--> statement-breakpoint
CREATE INDEX `members_tier_status_idx` ON `members` (`verificationTier`,`accountStatus`);--> statement-breakpoint
CREATE INDEX `programs_active_idx` ON `programs` (`isActive`);