import prisma from "../../../prisma/client.js";

const getAgents = async (userId) => {
  // Find business for this user
  const business = await prisma.business.findFirst({
    where: { ownerId: userId },
  });

  if (!business) {
    return [];
  }

  const agents = await prisma.agent.findMany({
    where: { businessId: business.id },
    select: {
      id: true,
      businessId: true,
      name: true,
      twilioNumber: true,
      managerNumber: true,
      status: true,
      vapiAgentId: true,
    },
  });

  return agents;
};

export const AIAgentService = {
  getAgents,
};
