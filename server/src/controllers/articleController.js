import {
  archiveOwnedArticle,
  createArticle,
  getPublishedArticleBySlug,
  listOwnedArticles,
  listPublishedArticles,
  publishOwnedArticle,
  updateOwnedArticle,
} from "../services/articleService.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

import {
  serializeResource,
  serializeResources,
} from "../utils/serializeResource.js";

export const create = asyncHandler(async (req, res) => {
  const article = await createArticle(
    req.user._id,
    req.body
  );

  return sendSuccess(res, {
    statusCode: 201,
    message: "Article created successfully.",
    data: {
      article: serializeResource(article),
    },
  });
});

export const listPublished = asyncHandler(
  async (req, res) => {
    const result = await listPublishedArticles(
      req.validated.query
    );

    return sendSuccess(res, {
      message:
        result.articles.length > 0
          ? "Articles retrieved successfully."
          : "No articles found.",
      data: {
        articles: serializeResources(result.articles),
        pagination: result.pagination,
      },
    });
  }
);

export const getPublished = asyncHandler(
  async (req, res) => {
    const article = await getPublishedArticleBySlug(
      req.params.slug
    );

    return sendSuccess(res, {
      message: "Article retrieved successfully.",
      data: {
        article: serializeResource(article),
      },
    });
  }
);

export const listMine = asyncHandler(async (req, res) => {
  const result = await listOwnedArticles(
    req.user._id,
    req.validated.query
  );

  return sendSuccess(res, {
    message:
      result.articles.length > 0
        ? "Your articles were retrieved successfully."
        : "No articles found.",
    data: {
      articles: serializeResources(result.articles),
      pagination: result.pagination,
    },
  });
});

export const updateMine = asyncHandler(
  async (req, res) => {
    const article = await updateOwnedArticle(
      req.params.articleId,
      req.user._id,
      req.body
    );

    return sendSuccess(res, {
      message: "Article updated successfully.",
      data: {
        article: serializeResource(article),
      },
    });
  }
);

export const publishMine = asyncHandler(
  async (req, res) => {
    const article = await publishOwnedArticle(
      req.params.articleId,
      req.user._id
    );

    return sendSuccess(res, {
      message: "Article published successfully.",
      data: {
        article: serializeResource(article),
      },
    });
  }
);

export const archiveMine = asyncHandler(
  async (req, res) => {
    const article = await archiveOwnedArticle(
      req.params.articleId,
      req.user._id
    );

    return sendSuccess(res, {
      message: "Article archived successfully.",
      data: {
        article: serializeResource(article),
      },
    });
  }
);