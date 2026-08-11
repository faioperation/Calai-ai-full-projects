-- Add forwarded_call to CallType enum
ALTER TYPE "CallType" ADD VALUE IF NOT EXISTS 'forwarded_call';

-- Add offDays to business_settings
ALTER TABLE "business_settings"
ADD COLUMN IF NOT EXISTS "offDays" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];