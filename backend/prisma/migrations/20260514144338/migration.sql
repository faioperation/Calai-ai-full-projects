/*
  Warnings:

  - A unique constraint covering the columns `[vapiCallId]` on the table `calls` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[callId]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "call_summaries" ADD COLUMN     "transcript" TEXT;

-- AlterTable
ALTER TABLE "calls" ADD COLUMN     "customerNumber" TEXT,
ADD COLUMN     "vapiCallId" TEXT,
ALTER COLUMN "type" SET DEFAULT 'ai_call';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "items" JSONB,
ALTER COLUMN "customerName" DROP NOT NULL,
ALTER COLUMN "customerEmail" DROP NOT NULL,
ALTER COLUMN "totalPrice" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "calls_vapiCallId_key" ON "calls"("vapiCallId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_callId_key" ON "orders"("callId");
