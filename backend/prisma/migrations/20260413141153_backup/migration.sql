/*
  Warnings:

  - You are about to drop the column `price` on the `plans` table. All the data in the column will be lost.
  - Added the required column `priceMonthly` to the `plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceYearly` to the `plans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "plans" DROP COLUMN "price",
ADD COLUMN     "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "priceMonthly" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "priceYearly" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "stripeMonthlyPriceId" TEXT,
ADD COLUMN     "stripeYearlyPriceId" TEXT;
