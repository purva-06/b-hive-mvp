import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid resource identifier.");

const proposedContentSchema = z
  .string({
    required_error: "Proposed content is required.",
  })
  .trim()
  .min(
    50,
    "Proposed content must contain at least 50 characters."
  );

const messageSchema = z
  .string({
    required_error: "Contribution message is required.",
  })
  .trim()
  .min(
    10,
    "Contribution message must contain at least 10 characters."
  )
  .max(
    1000,
    "Contribution message cannot exceed 1000 characters."
  );

const reviewCommentSchema = z
  .string({
    required_error: "Review comment is required.",
  })
  .trim()
  .min(
    5,
    "Review comment must contain at least 5 characters."
  )
  .max(
    1000,
    "Review comment cannot exceed 1000 characters."
  );

export const submitContributionSchema = z.object({
  params: z.object({
    articleId: objectIdSchema,
  }),

  body: z
    .object({
      proposedContent: proposedContentSchema,
      message: messageSchema,
    })
    .strict(),
});

export const contributionIdSchema = z.object({
  params: z.object({
    contributionId: objectIdSchema,
  }),
});

export const resubmitContributionSchema = z.object({
  params: z.object({
    contributionId: objectIdSchema,
  }),

  body: z
    .object({
      proposedContent: proposedContentSchema,
      message: messageSchema,
    })
    .strict(),
});

export const reviewContributionSchema = z.object({
  params: z.object({
    contributionId: objectIdSchema,
  }),

  body: z
    .object({
      reviewComment: reviewCommentSchema,
    })
    .strict(),
});

export const acceptContributionSchema = z.object({
  params: z.object({
    contributionId: objectIdSchema,
  }),

  body: z
    .object({
      reviewComment: z
        .string()
        .trim()
        .max(
          1000,
          "Review comment cannot exceed 1000 characters."
        )
        .optional(),
    })
    .strict(),
});

export const contributionListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(50)
      .default(10),

    sort: z
      .enum(["newest", "oldest", "recently_updated"])
      .default("newest"),

    status: z
      .enum([
        "pending",
        "changes_requested",
        "accepted",
        "rejected",
        "withdrawn",
      ])
      .optional(),
  }),
});

export const articleContributionListSchema = z.object({
  params: z.object({
    articleId: objectIdSchema,
  }),

  query: z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(50)
      .default(10),

    sort: z
      .enum(["newest", "oldest", "recently_updated"])
      .default("newest"),

    status: z
      .enum([
        "pending",
        "changes_requested",
        "accepted",
        "rejected",
        "withdrawn",
      ])
      .optional(),
  }),
});