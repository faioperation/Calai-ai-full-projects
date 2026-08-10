-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('PICKUP', 'DELIVERY');

-- AlterTable
ALTER TABLE "business_settings" ADD COLUMN     "closingTime" TEXT,
ADD COLUMN     "openingTime" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "deliveryAddress" TEXT,
ADD COLUMN     "orderType" "OrderType" NOT NULL DEFAULT 'PICKUP';
