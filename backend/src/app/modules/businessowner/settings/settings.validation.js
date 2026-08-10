import { z } from "zod";

const updateProfileSchema = z.object({
  body: z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
  }),
});

const updatePhoneSchema = z.object({
  body: z.object({
    phone: z.string({ required_error: "Phone number is required" }),
  }),
});

const updateBusinessSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    address: z.string().optional(),
  }),
});

export const SettingsValidation = {
  updateProfileSchema,
  updatePhoneSchema,
  updateBusinessSchema,
};
