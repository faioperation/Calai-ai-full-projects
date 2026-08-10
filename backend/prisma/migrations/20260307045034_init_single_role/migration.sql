-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('system_owner', 'business_owner', 'staff', 'customer');

-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('email', 'google', 'facebook', 'apple');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "avatarUrl" TEXT,
    "avatarUrlPath" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'customer',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "oauthProvider" "OAuthProvider" NOT NULL DEFAULT 'email',
    "oauthProviderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "forgotPasswordStatus" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MobileUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "avatarUrl" TEXT,
    "avatarUrlPath" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'customer',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "oauthProvider" "OAuthProvider" NOT NULL DEFAULT 'email',
    "oauthProviderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "forgotPasswordStatus" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MobileUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "MobileUser_email_key" ON "MobileUser"("email");

-- CreateIndex
CREATE INDEX "MobileUser_role_idx" ON "MobileUser"("role");
