/*
  Warnings:

  - You are about to drop the column `callLimit` on the `plans` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "plans" DROP COLUMN "callLimit",
ADD COLUMN     "callCountLimit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "callMinutesLimit" INTEGER NOT NULL DEFAULT 0;
