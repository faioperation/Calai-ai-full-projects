import { z } from "zod";

const updateBusinessHourSchema = z.object({
  body: z.object({
    openingTime: z.string().nullable().optional(),
    closingTime: z.string().nullable().optional(),
    offDays: z.array(z.string()).optional(),
  }),
});

export const BusinessHourValidation = {
  updateBusinessHourSchema,
};
