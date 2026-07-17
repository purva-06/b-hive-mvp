import { z } from "zod";

const titleSchema = z
  .string()
  .trim()
  .min(5, "Title must contain at least 5 characters.")
  .max(180, "Title cannot exceed 180 characters.");

const summarySchema = z
  .string()
  .trim()
  .min(20, "Summary must contain at least 20 characters.")
  .max(500, "Summary cannot exceed 500 characters.");

const contentSchema = z
  .string()
  .trim()
  .min(50, "Content must contain at least 50 characters.");

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid article identifier.");

export const createArticleSchema = z.object({
  body: z
    .object({
      title: titleSchema,
      summary: summarySchema,
      content: contentSchema,
    })
    .strict(),
});

export const updateArticleSchema = z.object({
  params: z.object({
    articleId: objectIdSchema,
  }),

  body: z
    .object({
      title: titleSchema.optional(),
      summary: summarySchema.optional(),
      content: contentSchema.optional(),

      changeDescription: z
        .string()
        .trim()
        .max(500, "Change description cannot exceed 500 characters.")
        .optional(),
    })
    .strict()
    .refine(
      ({ title, summary, content }) =>
        title !== undefined ||
        summary !== undefined ||
        content !== undefined,
      {
        message: "Provide at least one article field to update.",
      }
    ),
});

export const articleIdSchema = z.object({
  params: z.object({
    articleId: objectIdSchema,
  }),
});

export const articleListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),

    sort: z
      .enum(["newest", "oldest", "recently_updated"])
      .default("newest"),

    search: z.string().trim().max(100).optional(),
  }),
});

export const myArticlesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),

    sort: z
      .enum(["newest", "oldest", "recently_updated"])
      .default("newest"),

    status: z.enum(["draft", "published", "archived"]).optional(),
  }),
});

export const articleSlugSchema = z.object({
  params: z.object({
    slug: z
      .string()
      .trim()
      .min(1, "Article slug is required.")
      .max(220, "Article slug is too long."),
  }),
});