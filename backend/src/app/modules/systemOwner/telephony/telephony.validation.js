import { z } from "zod";

const createTelephonySchema = z.object({
  body: z.object({
    assistant_id: z.string({ required_error: "Assistant ID is required" }),
    twilio_number: z.string({ required_error: "Twilio number is required" }),
    manager_number: z.string({ required_error: "Manager number is required" }),
    businessId: z.string({ required_error: "Business ID is required" }).uuid("Invalid Business ID format"),
  }),
});

const updateTelephonySchema = z.object({
  body: z
    .object({
      twilioNumber: z.string().optional(),
      managerNumber: z.string().optional(),
    })
    .strict("Only twilioNumber and managerNumber can be updated"),
  params: z.object({
    id: z.string().uuid("Invalid Agent ID format"),
  }),
});

const getOrDeleteTelephonySchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Agent ID format"),
  }),
});

const getUnconfiguredAgentsSchema = z.object({
  params: z.object({
    businessId: z.string().uuid("Invalid Business ID format"),
  }),
});

export const TelephonyValidation = {
  createTelephonySchema,
  updateTelephonySchema,
  getOrDeleteTelephonySchema,
  getUnconfiguredAgentsSchema,
};
