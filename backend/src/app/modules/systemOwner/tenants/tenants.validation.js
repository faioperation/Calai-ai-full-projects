import { z } from "zod";

const updateTenantSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, "Name cannot be empty").optional(),
      status: z
        .enum(["active", "suspended", "trial", "expired"], {
          invalid_type_error:
            "Status must be one of: active, suspended, trial, expired",
        })
        .optional(),
    })
    .strict(),
});

const createTenantSchema = z.object({
  body: z.object({
    first_name: z.string({ required_error: "First name is required" }),
    last_name: z.string({ required_error: "Last name is required" }),
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
    business_name: z.string({ required_error: "Business name is required" }),
    phone: z.string().optional(),
    business_type: z
      .enum(["restaurent", "take_way"], {
        invalid_type_error:
          "Business type must be either 'restaurent' or 'take_way'",
      })
      .optional(),
  }),
});

export const TenantsValidation = {
  updateTenantSchema,
  createTenantSchema,
};
