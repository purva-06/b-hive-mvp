import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid article identifier.");

export const versionListSchema = z.object({
  params: z.object({
    articleId: objectIdSchema,
  }),

  query: z.object({
    page: z.coerce
      .number()
      .int()
      .min(1, "Page must be at least 1.")
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1, "Limit must be at least 1.")
      .max(50, "Limit cannot exceed 50.")
      .default(10),

    sort: z.enum(["newest", "oldest"]).default("newest"),
  }),
});

export const versionDetailSchema = z.object({
  params: z.object({
    articleId: objectIdSchema,

    versionNumber: z.coerce
      .number()
      .int()
      .min(1, "Version number must be at least 1."),
  }),
});