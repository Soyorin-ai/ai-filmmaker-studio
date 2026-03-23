-- AlterTable
ALTER TABLE "assets" ALTER COLUMN "file_size" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "exports" ALTER COLUMN "file_size" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "quotas" ALTER COLUMN "storage_bytes" SET DATA TYPE BIGINT,
ALTER COLUMN "storage_used" SET DATA TYPE BIGINT,
ALTER COLUMN "storage_total" SET DATA TYPE BIGINT;
