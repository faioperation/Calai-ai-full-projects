/*
  Warnings:

  - A unique constraint covering the columns `[vapiAgentId]` on the table `agent` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "agent_businessId_key";

-- AlterTable
ALTER TABLE "training_sessions" ADD COLUMN     "agentId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "agent_vapiAgentId_key" ON "agent"("vapiAgentId");

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
