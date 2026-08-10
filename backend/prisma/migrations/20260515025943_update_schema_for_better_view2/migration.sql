/*
  Warnings:

  - You are about to drop the column `usersId` on the `api_keys` table. All the data in the column will be lost.
  - Added the required column `userId` to the `api_keys` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `plans` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "api_keys" DROP CONSTRAINT "api_keys_usersId_fkey";

-- AlterTable
ALTER TABLE "api_keys" DROP COLUMN "usersId",
ADD COLUMN     "userId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD';

-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "platform_settings" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
