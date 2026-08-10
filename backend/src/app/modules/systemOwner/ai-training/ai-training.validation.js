import { z } from "zod";

const createAgentValidationSchema = z.object({
  body: z.object({
    agent_name: z.string({
      required_error: "Agent name is required",
    }),
    businessId: z
      .string({
        required_error: "Business ID is required",
      })
      .uuid("Invalid Business ID format"),
  }),
});

const updateSpecialOffersValidationSchema = z.object({
  body: z.object({
    enabled: z.boolean({
      required_error: "enabled is required and must be a boolean",
    }),
  }),
});

export const AIAgentValidation = {
  createAgentValidationSchema,
  updateSpecialOffersValidationSchema,
};
