-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('restaurent', 'take_way');

-- Clean up any existing incompatible values to prevent conversion failures
UPDATE "business"
SET "businessType" = NULL
WHERE "businessType" NOT IN ('restaurent', 'take_way');

-- AlterTable
ALTER TABLE "business" ALTER COLUMN "businessType" TYPE "BusinessType" USING ("businessType"::text::"BusinessType");
