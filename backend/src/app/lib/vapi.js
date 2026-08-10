import axios from "axios";
import { envVars } from "../config/env.js";

const vapiClient = axios.create({
  baseURL: "https://api.vapi.ai",
  headers: {
    Authorization: `Bearer ${envVars.VAPI_API_KEY}`,
    "Content-Type": "application/json",
  },
});

/**
 * Fetch calls from Vapi for a specific assistant
 * @param {string} assistantId - The Vapi Assistant ID
 * @returns {Promise<Array>} - List of calls
 */
const fetchCalls = async (assistantId) => {
  try {
    const response = await vapiClient.get("/call", {
      params: {
        assistantId: assistantId,
        limit: 100, // Adjust as needed
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Vapi API Error (fetchCalls):`,
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch calls from Vapi",
    );
  }
};

/**
 * Fetch a single call by its ID from Vapi
 * @param {string} callId - The Vapi Call ID
 * @returns {Promise<Object>} - Call details
 */
const fetchCallById = async (callId) => {
  try {
    const response = await vapiClient.get(`/call/${callId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Vapi API Error (fetchCallById):`,
      error.response?.data || error.message,
    );
    return null; // Return null so we don't crash but fail gracefully
  }
};

/**
 * Delete an assistant/agent from Vapi
 * @param {string} assistantId - The Vapi Assistant ID to delete
 * @returns {Promise<boolean>} - Success status
 */
const deleteAssistant = async (assistantId) => {
  try {
    const response = await vapiClient.delete(`/assistant/${assistantId}`);
    return true;
  } catch (error) {
    console.error(
      `Vapi API Error (deleteAssistant):`,
      error.response?.data || error.message,
    );
    return false; // Return false so we fail gracefully instead of crashing
  }
};

export const VapiLib = {
  fetchCalls,
  fetchCallById,
  deleteAssistant,
};
