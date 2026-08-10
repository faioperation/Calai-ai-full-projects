/*
  Warnings:

  - The primary key for the `api_keys` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `api_key` on the `api_keys` table. All the data in the column will be lost.
  - You are about to drop the column `business_id` on the `api_keys` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `api_keys` table. All the data in the column will be lost.
  - You are about to drop the column `last_used` on the `api_keys` table. All the data in the column will be lost.
  - The primary key for the `business` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `business` table. All the data in the column will be lost.
  - You are about to drop the column `owner_id` on the `business` table. All the data in the column will be lost.
  - The primary key for the `business_settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `business_address` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `business_id` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `business_name` on the `business_settings` table. All the data in the column will be lost.
  - The primary key for the `call_summaries` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `call_id` on the `call_summaries` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `call_summaries` table. All the data in the column will be lost.
  - You are about to drop the column `pdf_url` on the `call_summaries` table. All the data in the column will be lost.
  - The primary key for the `calls` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `business_id` on the `calls` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `calls` table. All the data in the column will be lost.
  - You are about to drop the column `end_time` on the `calls` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `calls` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `calls` table. All the data in the column will be lost.
  - The primary key for the `integrations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `business_id` on the `integrations` table. All the data in the column will be lost.
  - The primary key for the `invoices` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `billing_cycle` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `business_id` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `invoice_no` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_id` on the `invoices` table. All the data in the column will be lost.
  - The primary key for the `plans` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `call_limit` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `message_limit` on the `plans` table. All the data in the column will be lost.
  - The primary key for the `platform_settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `logo_url` on the `platform_settings` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `platform_settings` table. All the data in the column will be lost.
  - The primary key for the `subscriptions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `business_id` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `plan_id` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `subscriptions` table. All the data in the column will be lost.
  - The primary key for the `training_files` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `training_files` table. All the data in the column will be lost.
  - You are about to drop the column `file_name` on the `training_files` table. All the data in the column will be lost.
  - You are about to drop the column `file_type` on the `training_files` table. All the data in the column will be lost.
  - You are about to drop the column `file_url` on the `training_files` table. All the data in the column will be lost.
  - You are about to drop the column `session_id` on the `training_files` table. All the data in the column will be lost.
  - The primary key for the `training_sessions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `business_id` on the `training_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `training_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `training_sessions` table. All the data in the column will be lost.
  - The primary key for the `usage_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `business_id` on the `usage_logs` table. All the data in the column will be lost.
  - You are about to drop the column `drop_rate` on the `usage_logs` table. All the data in the column will be lost.
  - You are about to drop the column `total_calls` on the `usage_logs` table. All the data in the column will be lost.
  - You are about to drop the column `total_duration` on the `usage_logs` table. All the data in the column will be lost.
  - You are about to drop the column `total_messages` on the `usage_logs` table. All the data in the column will be lost.
  - The primary key for the `user_business` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `business_id` on the `user_business` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `user_business` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `user_business` table. All the data in the column will be lost.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `is_verified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.
  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `ai_samples` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `call_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `faqs` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[businessId]` on the table `business_settings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[callId]` on the table `call_summaries` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[businessId]` on the table `integrations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apiKey` to the `api_keys` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessId` to the `api_keys` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `api_keys` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `api_keys` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `usersId` to the `api_keys` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `business` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `business` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `business` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `businessAddress` to the `business_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessId` to the `business_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessName` to the `business_settings` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `business_settings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `callId` to the `call_summaries` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `call_summaries` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `businessId` to the `calls` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `calls` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `calls` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `calls` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `calls` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `calls` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `calls` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `businessId` to the `integrations` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `integrations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `billingCycle` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessId` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoiceNo` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subscriptionId` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `invoices` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `invoices` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `callLimit` to the `plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `messageLimit` to the `plans` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `plans` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `name` on the `plans` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `logoUrl` to the `platform_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `platform_settings` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `platform_settings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `businessId` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planId` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `subscriptions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `subscriptions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `fileName` to the `training_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileType` to the `training_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileUrl` to the `training_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionId` to the `training_files` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `training_files` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `businessId` to the `training_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `training_sessions` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `training_sessions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `training_sessions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `training_sessions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `businessId` to the `usage_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dropRate` to the `usage_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalCalls` to the `usage_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalDuration` to the `usage_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalMessages` to the `usage_logs` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `usage_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `businessId` to the `user_business` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `user_business` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `user_business` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `firstName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SYSTEM_OWNER', 'BUSINESS_OWNER');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('active', 'suspended', 'expired');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'expired', 'canceled');

-- CreateEnum
CREATE TYPE "TrainingType" AS ENUM ('text', 'voice', 'faq');

-- CreateEnum
CREATE TYPE "TrainingStatus" AS ENUM ('processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "CallType" AS ENUM ('ai_call', 'text_call');

-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('completed', 'failed');

-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('ai', 'user');

-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('paid', 'unpaid');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('monthly', 'yearly');

-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE');

-- DropForeignKey
ALTER TABLE "ai_samples" DROP CONSTRAINT "ai_samples_business_id_fkey";

-- DropForeignKey
ALTER TABLE "api_keys" DROP CONSTRAINT "api_keys_business_id_fkey";

-- DropForeignKey
ALTER TABLE "api_keys" DROP CONSTRAINT "api_keys_usersId_fkey";

-- DropForeignKey
ALTER TABLE "business" DROP CONSTRAINT "business_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "business_settings" DROP CONSTRAINT "business_settings_business_id_fkey";

-- DropForeignKey
ALTER TABLE "call_messages" DROP CONSTRAINT "call_messages_call_id_fkey";

-- DropForeignKey
ALTER TABLE "call_summaries" DROP CONSTRAINT "call_summaries_call_id_fkey";

-- DropForeignKey
ALTER TABLE "calls" DROP CONSTRAINT "calls_business_id_fkey";

-- DropForeignKey
ALTER TABLE "calls" DROP CONSTRAINT "calls_user_id_fkey";

-- DropForeignKey
ALTER TABLE "faqs" DROP CONSTRAINT "faqs_business_id_fkey";

-- DropForeignKey
ALTER TABLE "integrations" DROP CONSTRAINT "integrations_business_id_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_business_id_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_subscription_id_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_business_id_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "training_files" DROP CONSTRAINT "training_files_session_id_fkey";

-- DropForeignKey
ALTER TABLE "training_sessions" DROP CONSTRAINT "training_sessions_business_id_fkey";

-- DropForeignKey
ALTER TABLE "training_sessions" DROP CONSTRAINT "training_sessions_created_by_fkey";

-- DropForeignKey
ALTER TABLE "usage_logs" DROP CONSTRAINT "usage_logs_business_id_fkey";

-- DropForeignKey
ALTER TABLE "user_business" DROP CONSTRAINT "user_business_business_id_fkey";

-- DropForeignKey
ALTER TABLE "user_business" DROP CONSTRAINT "user_business_user_id_fkey";

-- DropIndex
DROP INDEX "business_settings_business_id_key";

-- DropIndex
DROP INDEX "call_summaries_call_id_key";

-- DropIndex
DROP INDEX "integrations_business_id_key";

-- AlterTable
ALTER TABLE "api_keys" DROP CONSTRAINT "api_keys_pkey",
DROP COLUMN "api_key",
DROP COLUMN "business_id",
DROP COLUMN "created_at",
DROP COLUMN "last_used",
ADD COLUMN     "apiKey" TEXT NOT NULL,
ADD COLUMN     "businessId" UUID NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastUsed" TIMESTAMP(3),
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "UserStatus" NOT NULL,
DROP COLUMN "usersId",
ADD COLUMN     "usersId" UUID NOT NULL,
ADD CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "business" DROP CONSTRAINT "business_pkey",
DROP COLUMN "created_at",
DROP COLUMN "owner_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ownerId" UUID NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "TenantStatus" NOT NULL,
ADD CONSTRAINT "business_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "business_settings" DROP CONSTRAINT "business_settings_pkey",
DROP COLUMN "business_address",
DROP COLUMN "business_id",
DROP COLUMN "business_name",
ADD COLUMN     "businessAddress" TEXT NOT NULL,
ADD COLUMN     "businessId" UUID NOT NULL,
ADD COLUMN     "businessName" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "business_settings_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "call_summaries" DROP CONSTRAINT "call_summaries_pkey",
DROP COLUMN "call_id",
DROP COLUMN "created_at",
DROP COLUMN "pdf_url",
ADD COLUMN     "callId" UUID NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "pdfUrl" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "call_summaries_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "calls" DROP CONSTRAINT "calls_pkey",
DROP COLUMN "business_id",
DROP COLUMN "created_at",
DROP COLUMN "end_time",
DROP COLUMN "start_time",
DROP COLUMN "user_id",
ADD COLUMN     "businessId" UUID NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" UUID NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "CallType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "CallStatus" NOT NULL,
ADD CONSTRAINT "calls_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "integrations" DROP CONSTRAINT "integrations_pkey",
DROP COLUMN "business_id",
ADD COLUMN     "businessId" UUID NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "integrations_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_pkey",
DROP COLUMN "billing_cycle",
DROP COLUMN "business_id",
DROP COLUMN "created_at",
DROP COLUMN "invoice_no",
DROP COLUMN "subscription_id",
ADD COLUMN     "billingCycle" "BillingCycle" NOT NULL,
ADD COLUMN     "businessId" UUID NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "invoiceNo" TEXT NOT NULL,
ADD COLUMN     "subscriptionId" UUID NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "BillingStatus" NOT NULL,
ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "plans" DROP CONSTRAINT "plans_pkey",
DROP COLUMN "call_limit",
DROP COLUMN "message_limit",
ADD COLUMN     "callLimit" INTEGER NOT NULL,
ADD COLUMN     "messageLimit" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "name",
ADD COLUMN     "name" "PlanType" NOT NULL,
ALTER COLUMN "features" DROP DEFAULT,
ADD CONSTRAINT "plans_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "platform_settings" DROP CONSTRAINT "platform_settings_pkey",
DROP COLUMN "logo_url",
DROP COLUMN "updated_at",
ADD COLUMN     "logoUrl" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_pkey",
DROP COLUMN "business_id",
DROP COLUMN "end_date",
DROP COLUMN "plan_id",
DROP COLUMN "start_date",
ADD COLUMN     "businessId" UUID NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "planId" UUID NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "SubscriptionStatus" NOT NULL,
ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "training_files" DROP CONSTRAINT "training_files_pkey",
DROP COLUMN "created_at",
DROP COLUMN "file_name",
DROP COLUMN "file_type",
DROP COLUMN "file_url",
DROP COLUMN "session_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "fileType" TEXT NOT NULL,
ADD COLUMN     "fileUrl" TEXT NOT NULL,
ADD COLUMN     "sessionId" UUID NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "training_files_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "training_sessions" DROP CONSTRAINT "training_sessions_pkey",
DROP COLUMN "business_id",
DROP COLUMN "created_at",
DROP COLUMN "created_by",
ADD COLUMN     "businessId" UUID NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" UUID NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "TrainingType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "TrainingStatus" NOT NULL,
ADD CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "usage_logs" DROP CONSTRAINT "usage_logs_pkey",
DROP COLUMN "business_id",
DROP COLUMN "drop_rate",
DROP COLUMN "total_calls",
DROP COLUMN "total_duration",
DROP COLUMN "total_messages",
ADD COLUMN     "businessId" UUID NOT NULL,
ADD COLUMN     "dropRate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalCalls" INTEGER NOT NULL,
ADD COLUMN     "totalDuration" INTEGER NOT NULL,
ADD COLUMN     "totalMessages" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "usage_logs_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "user_business" DROP CONSTRAINT "user_business_pkey",
DROP COLUMN "business_id",
DROP COLUMN "created_at",
DROP COLUMN "user_id",
ADD COLUMN     "businessId" UUID NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" UUID NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "user_business_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "created_at",
DROP COLUMN "first_name",
DROP COLUMN "is_verified",
DROP COLUMN "last_name",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'BUSINESS_OWNER',
DROP COLUMN "status",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'active',
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "ai_samples";

-- DropTable
DROP TABLE "call_messages";

-- DropTable
DROP TABLE "faqs";

-- DropEnum
DROP TYPE "billing_cycle";

-- DropEnum
DROP TYPE "billing_status";

-- DropEnum
DROP TYPE "call_status";

-- DropEnum
DROP TYPE "call_type";

-- DropEnum
DROP TYPE "plan_type";

-- DropEnum
DROP TYPE "sender_type";

-- DropEnum
DROP TYPE "subscription_status";

-- DropEnum
DROP TYPE "tenant_status";

-- DropEnum
DROP TYPE "training_status";

-- DropEnum
DROP TYPE "training_type";

-- DropEnum
DROP TYPE "user_role";

-- DropEnum
DROP TYPE "user_status";

-- CreateTable
CREATE TABLE "items" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "callId" UUID NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "twilioNumber" TEXT NOT NULL,
    "managerNumber" TEXT NOT NULL,
    "script" TEXT NOT NULL,
    "status" "AgentStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "agent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agent_businessId_key" ON "agent"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "business_settings_businessId_key" ON "business_settings"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "call_summaries_callId_key" ON "call_summaries"("callId");

-- CreateIndex
CREATE UNIQUE INDEX "integrations_businessId_key" ON "integrations"("businessId");

-- AddForeignKey
ALTER TABLE "business" ADD CONSTRAINT "business_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_business" ADD CONSTRAINT "user_business_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_business" ADD CONSTRAINT "user_business_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_files" ADD CONSTRAINT "training_files_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "training_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_summaries" ADD CONSTRAINT "call_summaries_callId_fkey" FOREIGN KEY ("callId") REFERENCES "calls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_callId_fkey" FOREIGN KEY ("callId") REFERENCES "calls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_settings" ADD CONSTRAINT "business_settings_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent" ADD CONSTRAINT "agent_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
