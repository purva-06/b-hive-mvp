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

function normalizeArticle(article) {
  const value =
    typeof article.toObject === "function"
      ? article.toObject()
      : article;

  const { _id, ...rest } = value;

  return {
    id: _id.toString(),
    ...rest,
  };
}

export const create = asyncHandler(async (req, res) => {
  const article = await createArticle(req.user._id, req.body);

  res.status(201).json({
    success: true,
    message: "Article created successfully.",
    data: {
      article: normalizeArticle(article),
    },
  });
});

export const listPublished = asyncHandler(async (req, res) => {
  const result = await listPublishedArticles(req.query);

  res.status(200).json({
    success: true,
    message:
      result.articles.length > 0
        ? "Articles retrieved successfully."
        : "No articles found.",
    data: {
      articles: result.articles.map(normalizeArticle),
      pagination: result.pagination,
    },
  });
});

export const getPublished = asyncHandler(async (req, res) => {
  const article = await getPublishedArticleBySlug(req.params.slug);

  res.status(200).json({
    success: true,
    message: "Article retrieved successfully.",
    data: {
      article: normalizeArticle(article),
    },
  });
});

export const listMine = asyncHandler(async (req, res) => {
  const result = await listOwnedArticles(req.user._id, req.query);

  res.status(200).json({
    success: true,
    message:
      result.articles.length > 0
        ? "Your articles were retrieved successfully."
        : "No articles found.",
    data: {
      articles: result.articles.map(normalizeArticle),
      pagination: result.pagination,
    },
  });
});

export const updateMine = asyncHandler(async (req, res) => {
  const article = await updateOwnedArticle(
    req.params.articleId,
    req.user._id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Article updated successfully.",
    data: {
      article: normalizeArticle(article),
    },
  });
});

export const publishMine = asyncHandler(async (req, res) => {
  const article = await publishOwnedArticle(
    req.params.articleId,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: "Article published successfully.",
    data: {
      article: normalizeArticle(article),
    },
  });
});

export const archiveMine = asyncHandler(async (req, res) => {
  const article = await archiveOwnedArticle(
    req.params.articleId,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: "Article archived successfully.",
    data: {
      article: normalizeArticle(article),
    },
  });
});