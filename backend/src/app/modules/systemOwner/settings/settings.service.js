import prisma from "../../../prisma/client.js";

const updatePlatformLogoInDB = async (logoUrl) => {
  // platform_settings is a singleton table
  const existingSettings = await prisma.platformSetting.findFirst();

  if (existingSettings) {
    return await prisma.platformSetting.update({
      where: { id: existingSettings.id },
      data: {
        logoUrl,
      },
    });
  } else {
    return await prisma.platformSetting.create({
      data: {
        logoUrl,
      },
    });
  }
};

const getPlatformLogoFromDB = async () => {
  const result = await prisma.platformSetting.findFirst();
  return result;
};

export const SettingsService = {
  updatePlatformLogoInDB,
  getPlatformLogoFromDB,
};
