/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `plans` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "call_summaries" ALTER COLUMN "summary" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "plans_name_key" ON "plans"("name");
