import { z } from "zod";

const queryLogsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : 10)),
    searchTerm: z.string().optional(),
    action: z.string().optional(),
    userEmail: z.string().optional(),
    startDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid start date format",
      }),
    endDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid end date format",
      }),
  }),
});

const getOrDeleteLogSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: "Invalid audit log ID format" }),
  }),
});

export const AuditLogsValidation = {
  queryLogsSchema,
  getOrDeleteLogSchema,
};
