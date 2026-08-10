import { StatusCodes } from "http-status-codes";
import prisma from "../../../prisma/client.js";
import DevBuildError from "../../../lib/DevBuildError.js";
import { syncBusinessAgentStatus } from "../../../utils/workingHoursScheduler.js";

const getBusinessHourByBusinessId = async (businessId) => {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { businessSettings: true },
  });

  if (!business) {
    throw new DevBuildError("Business not found", StatusCodes.NOT_FOUND);
  }

  return {
    businessId: business.id,
    businessName: business.name,
    openingTime: business.businessSettings?.openingTime || null,
    closingTime: business.businessSettings?.closingTime || null,
    offDays: business.businessSettings?.offDays || [],
  };
};

const updateBusinessHour = async (businessId, data) => {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });

  if (!business) {
    throw new DevBuildError("Business not found", StatusCodes.NOT_FOUND);
  }

  const { openingTime, closingTime, offDays } = data;

  const updatedSetting = await prisma.businessSetting.upsert({
    where: { businessId: business.id },
    update: {
      ...(openingTime !== undefined ? { openingTime } : {}),
      ...(closingTime !== undefined ? { closingTime } : {}),
      ...(offDays !== undefined ? { offDays } : {}),
    },
    create: {
      businessId: business.id,
      businessName: business.name,
      businessAddress: "",
      openingTime: openingTime || null,
      closingTime: closingTime || null,
      offDays: offDays || [],
    },
  });

  // Trigger immediate AI agent status check based on updated hours
  syncBusinessAgentStatus(business.id);

  return {
    businessId: business.id,
    businessName: business.name,
    openingTime: updatedSetting.openingTime,
    closingTime: updatedSetting.closingTime,
    offDays: updatedSetting.offDays,
  };
};

export const BusinessHourService = {
  getBusinessHourByBusinessId,
  updateBusinessHour,
};
