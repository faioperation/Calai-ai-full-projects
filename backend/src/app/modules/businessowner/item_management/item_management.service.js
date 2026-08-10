import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import prisma from "../../../prisma/client.js";
import { envVars } from "../../../config/env.js";
import { parseMenuFile } from "../../../utils/menuParser.js";

/**
 * Get all menu items for the authenticated business owner.
 *
 * @param {string} userId - The ID of the authenticated user.
 * @returns {Promise<Array>} List of items.
 */
const getItems = async (userId, filters = {}) => {
  // Find the business owned by this user
  const business = await prisma.business.findFirst({
    where: { ownerId: userId },
  });

  if (!business) {
    throw new Error("Business not found for this user");
  }

  const whereClause = { businessId: business.id };

  let targetVapiAgentId = filters.vapiAgentId || filters.agentId;

  if (targetVapiAgentId) {
    // Check if targetVapiAgentId is a valid UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(targetVapiAgentId)) {
      // Check if there is an Agent with this local database ID
      const agent = await prisma.agent.findFirst({
        where: { id: targetVapiAgentId, businessId: business.id },
      });
      // If found and has a vapiAgentId, use it. Otherwise, assume targetVapiAgentId is the vapiAgentId itself
      if (agent && agent.vapiAgentId) {
        targetVapiAgentId = agent.vapiAgentId;
      }
    }

    whereClause.vapiAgentId = targetVapiAgentId;
  }

  // Fetch all items for this business (optionally filtered by vapiAgentId)
  const items = await prisma.item.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  return items;
};

/**
 * Manually create a menu item.
 *
 * @param {string} userId - The ID of the authenticated user.
 * @param {object} itemData - The category, name, unit, and price of the item.
 * @returns {Promise<object>} Created item.
 */
const createItem = async (userId, itemData) => {
  const business = await prisma.business.findFirst({
    where: { ownerId: userId },
  });

  if (!business) {
    throw new Error("Business not found for this user");
  }

  const { category, name, unit, price } = itemData;

  const newItem = await prisma.item.create({
    data: {
      businessId: business.id,
      category: category || "General",
      name: name,
      unit: unit || "1 pc",
      price: parseFloat(price) || 0.0,
    },
  });

  return newItem;
};

/**
 * Manually update a menu item.
 *
 * @param {string} userId - The ID of the authenticated user.
 * @param {string} itemId - The ID of the item to update.
 * @param {object} itemData - The updated category, name, unit, and price.
 * @returns {Promise<object>} Updated item.
 */
const updateItem = async (userId, itemId, itemData) => {
  const business = await prisma.business.findFirst({
    where: { ownerId: userId },
  });

  if (!business) {
    throw new Error("Business not found for this user");
  }

  // Ensure the item belongs to the business
  const existingItem = await prisma.item.findFirst({
    where: { id: itemId, businessId: business.id },
  });

  if (!existingItem) {
    throw new Error("Item not found or access denied");
  }

  const { category, name, unit, price } = itemData;

  const updatedItem = await prisma.item.update({
    where: { id: itemId },
    data: {
      category: category !== undefined ? category : existingItem.category,
      name: name !== undefined ? name : existingItem.name,
      unit: unit !== undefined ? unit : existingItem.unit,
      price: price !== undefined ? parseFloat(price) : existingItem.price,
    },
  });

  return updatedItem;
};

/**
 * Delete a menu item.
 *
 * @param {string} userId - The ID of the authenticated user.
 * @param {string} itemId - The ID of the item to delete.
 * @returns {Promise<object>} Deleted item details.
 */
const deleteItem = async (userId, itemId) => {
  const business = await prisma.business.findFirst({
    where: { ownerId: userId },
  });

  if (!business) {
    throw new Error("Business not found for this user");
  }

  // Ensure the item belongs to the business
  const existingItem = await prisma.item.findFirst({
    where: { id: itemId, businessId: business.id },
  });

  if (!existingItem) {
    throw new Error("Item not found or access denied");
  }

  const deletedItem = await prisma.item.delete({
    where: { id: itemId },
  });

  return deletedItem;
};

/**
 * Upload menu file for an agent to the AI Service and sync the menu items in the database.
 *
 * @param {string} userId - The ID of the authenticated user.
 * @param {string} vapiAgentId - The Vapi Agent ID (assistant_id).
 * @param {object} file - The uploaded menu file details.
 * @returns {Promise<object>} Status and syncing results.
 */
const updateMenuFileInDB = async (userId, vapiAgentId, file) => {
  // 1. Verify the agent belongs to the user's business
  const agent = await prisma.agent.findFirst({
    where: { vapiAgentId: vapiAgentId },
    include: { business: true },
  });

  if (!agent) {
    throw new Error("Agent not found with this vapiAgentId");
  }

  if (agent.business.ownerId !== userId) {
    throw new Error("Unauthorized to access this agent");
  }

  const realBusinessUUID = agent.businessId;

  // 2. Prepare form data to forward to the AI Service
  const formData = new FormData();
  formData.append("menu_file", fs.createReadStream(file.path), {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  try {
    // 3. Hit the AI service PATCH endpoint with assistant_id as a query parameter
    const aiEndpoint = `${envVars.AI_SERVICE_URL}/api/agents/menu?assistant_id=${vapiAgentId}`;
    console.log(
      `Forwarding menu update to AI Service for agent [${agent.name || vapiAgentId}]`,
    );

    const aiResponse = await axios.patch(aiEndpoint, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    // 4. Parse the Excel/PDF file and update/sync items in DB
    const parsedItems = await parseMenuFile(file.path);
    let syncedCount = 0;

    if (parsedItems && parsedItems.length > 0) {
      await prisma.$transaction(async (tx) => {
        // Retrieve current database items for this business and agent
        const existingItems = await tx.item.findMany({
          where: {
            businessId: realBusinessUUID,
            vapiAgentId: vapiAgentId,
          },
          include: { orderItems: true },
        });

        const parsedKeys = new Set();

        for (const item of parsedItems) {
          const normalizedName = item.name.trim().toLowerCase();
          const normalizedCategory = item.category.trim().toLowerCase();
          const uniqueKey = `${normalizedName}||${normalizedCategory}`;
          parsedKeys.add(uniqueKey);

          const match = existingItems.find(
            (existing) =>
              existing.name.trim().toLowerCase() === normalizedName &&
              existing.category.trim().toLowerCase() === normalizedCategory,
          );

          if (match) {
            // Upsert: update details if already exists
            await tx.item.update({
              where: { id: match.id },
              data: {
                unit: item.unit,
                price: Number(item.price),
              },
            });
          } else {
            // Create new item
            await tx.item.create({
              data: {
                businessId: realBusinessUUID,
                category: item.category,
                name: item.name,
                unit: item.unit,
                price: Number(item.price),
                vapiAgentId: vapiAgentId,
              },
            });
          }
        }

        // Cleanup: delete items in DB that are not in the new file AND have never been ordered
        for (const existing of existingItems) {
          const existingKey = `${existing.name.trim().toLowerCase()}||${existing.category.trim().toLowerCase()}`;
          if (!parsedKeys.has(existingKey)) {
            if (existing.orderItems.length === 0) {
              await tx.item.delete({
                where: { id: existing.id },
              });
            } else {
              console.log(
                `ℹ️ Menu Sync: Preserving item "${existing.name}" (ID: ${existing.id}) as it is referenced in past orders.`,
              );
            }
          }
        }

        syncedCount = parsedItems.length;
      });
    }

    return {
      success: true,
      syncedCount,
      aiResponse: aiResponse.data,
    };
  } catch (error) {
    console.error("Menu Update Error:", error.response?.data || error.message);
    throw new Error(
      `Failed to update agent menu via AI Service: ${error.response?.data?.message || error.message}`,
    );
  }
};

export const ItemManagementService = {
  getItems,
  createItem,
  updateItem,
  deleteItem,
  updateMenuFileInDB,
};
