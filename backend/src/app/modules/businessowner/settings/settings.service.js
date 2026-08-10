import prisma from "../../../prisma/client.js";
import { syncBusinessAgentStatus } from "../../../utils/workingHoursScheduler.js";

const updateProfileInDB = async (userId, data) => {
  return await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatar: true,
      role: true,
    },
  });
};

const getProfileFromDB = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatar: true,
      role: true,
    },
  });
};

const getContactInfoFromDB = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      phone: true,
    },
  });
};

const updatePhoneInDB = async (userId, phone) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { phone },
  });
};

const getBusinessDetailsFromDB = async (userId) => {
  const business = await prisma.business.findFirst({
    where: { ownerId: userId },
    include: { businessSettings: true },
  });

  if (!business) {
    return null;
  }

  return {
    name: business.name,
    address: business.businessSettings?.businessAddress || "",
    openingTime: business.businessSettings?.openingTime || null,
    closingTime: business.businessSettings?.closingTime || null,
    offDays: business.businessSettings?.offDays || [],
  };
};

const updateBusinessDetailsInDB = async (userId, data) => {
  const business = await prisma.business.findFirst({
    where: { ownerId: userId },
  });

  if (!business) {
    throw new DevBuildError("Business not found", StatusCodes.NOT_FOUND);
  }

  return await prisma.$transaction(async (tx) => {
    const updatedBusiness = await tx.business.update({
      where: { id: business.id },
      data: { name: data.name },
    });

    await tx.businessSetting.upsert({
      where: { businessId: business.id },
      update: {
        businessName: data.name,
        businessAddress: data.address,
      },
      create: {
        businessId: business.id,
        businessName: data.name || updatedBusiness.name,
        businessAddress: data.address || "",
      },
    });

    return updatedBusiness;
  });
};

export const SettingsService = {
  updateProfileInDB,
  getProfileFromDB,
  getContactInfoFromDB,
  updatePhoneInDB,
  getBusinessDetailsFromDB,
  updateBusinessDetailsInDB,
};
