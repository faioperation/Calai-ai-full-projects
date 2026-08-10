-- AlterTable
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "offDays" TEXT[] DEFAULT ARRAY[]::TEXT[];
