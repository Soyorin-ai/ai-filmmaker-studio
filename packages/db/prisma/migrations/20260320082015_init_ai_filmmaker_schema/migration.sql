-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'CREATOR', 'ENTERPRISE', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'BASIC', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO');

-- CreateEnum
CREATE TYPE "AssetSource" AS ENUM ('GENERATE', 'UPLOAD', 'EDIT', 'IMPORT');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('IMAGE_GEN_TEXT', 'IMAGE_GEN_IMAGE', 'VIDEO_GEN_TEXT', 'VIDEO_GEN_IMAGE', 'VIDEO_GEN_FRAMES', 'IMAGE_EDIT', 'VIDEO_EDIT', 'VIDEO_MERGE', 'PROJECT_EXPORT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ExportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED');

-- CreateTable
CREATE TABLE "mikro_orm_migrations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "executed_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mikro_orm_migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "email_verified" TIMESTAMP(3),
    "phone_verified" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotas" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "image_count" INTEGER NOT NULL DEFAULT 10,
    "image_used" INTEGER NOT NULL DEFAULT 0,
    "image_total" INTEGER NOT NULL DEFAULT 10,
    "video_seconds" INTEGER NOT NULL DEFAULT 30,
    "video_used" INTEGER NOT NULL DEFAULT 0,
    "video_total" INTEGER NOT NULL DEFAULT 30,
    "storage_bytes" INTEGER NOT NULL DEFAULT 1073741824,
    "storage_used" INTEGER NOT NULL DEFAULT 0,
    "storage_total" INTEGER NOT NULL DEFAULT 1073741824,
    "max_concurrent" INTEGER NOT NULL DEFAULT 1,
    "plan_type" "PlanType" NOT NULL DEFAULT 'FREE',
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "quotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "plan_id" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "plan_type" "PlanType" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "cancelled_at" TIMESTAMP(3),
    "payment_method" TEXT,
    "payment_id" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "auto_renew" BOOLEAN NOT NULL DEFAULT false,
    "next_billing_date" TIMESTAMP(3),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cover" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "workflow" JSONB,
    "workflow_version" INTEGER NOT NULL DEFAULT 1,
    "timeline" JSONB,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "asset_count" INTEGER NOT NULL DEFAULT 0,
    "task_count" INTEGER NOT NULL DEFAULT 0,
    "settings" JSONB,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "project_id" UUID,
    "type" "AssetType" NOT NULL,
    "name" TEXT NOT NULL,
    "original_name" TEXT,
    "url" TEXT NOT NULL,
    "thumbnail" TEXT,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT,
    "metadata" JSONB,
    "source" "AssetSource" NOT NULL,
    "tags" TEXT[],
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "project_id" UUID,
    "type" "TaskType" NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "params" JSONB NOT NULL,
    "result" JSONB,
    "error" TEXT,
    "cost_image" INTEGER NOT NULL DEFAULT 0,
    "cost_video" INTEGER NOT NULL DEFAULT 0,
    "asset_id" UUID,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exports" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "format" TEXT NOT NULL,
    "resolution" TEXT NOT NULL,
    "quality" TEXT NOT NULL,
    "url" TEXT,
    "file_size" INTEGER,
    "status" "ExportStatus" NOT NULL DEFAULT 'PENDING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "scopes" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "rate_limit" INTEGER NOT NULL DEFAULT 100,
    "last_used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhooks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "events" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "fail_count" INTEGER NOT NULL DEFAULT 0,
    "last_triggered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "quotas_user_id_key" ON "quotas"("user_id");

-- CreateIndex
CREATE INDEX "quotas_user_id_idx" ON "quotas"("user_id");

-- CreateIndex
CREATE INDEX "quotas_expires_at_idx" ON "quotas"("expires_at");

-- CreateIndex
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_end_date_idx" ON "subscriptions"("end_date");

-- CreateIndex
CREATE INDEX "projects_user_id_idx" ON "projects"("user_id");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_created_at_idx" ON "projects"("created_at");

-- CreateIndex
CREATE INDEX "assets_user_id_idx" ON "assets"("user_id");

-- CreateIndex
CREATE INDEX "assets_project_id_idx" ON "assets"("project_id");

-- CreateIndex
CREATE INDEX "assets_type_idx" ON "assets"("type");

-- CreateIndex
CREATE INDEX "assets_source_idx" ON "assets"("source");

-- CreateIndex
CREATE INDEX "assets_created_at_idx" ON "assets"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_asset_id_key" ON "tasks"("asset_id");

-- CreateIndex
CREATE INDEX "tasks_user_id_idx" ON "tasks"("user_id");

-- CreateIndex
CREATE INDEX "tasks_project_id_idx" ON "tasks"("project_id");

-- CreateIndex
CREATE INDEX "tasks_type_idx" ON "tasks"("type");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_created_at_idx" ON "tasks"("created_at");

-- CreateIndex
CREATE INDEX "exports_project_id_idx" ON "exports"("project_id");

-- CreateIndex
CREATE INDEX "exports_status_idx" ON "exports"("status");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "api_keys_user_id_idx" ON "api_keys"("user_id");

-- CreateIndex
CREATE INDEX "api_keys_key_idx" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "webhooks_user_id_idx" ON "webhooks"("user_id");

-- AddForeignKey
ALTER TABLE "quotas" ADD CONSTRAINT "quotas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exports" ADD CONSTRAINT "exports_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
