import mongoose from "mongoose";

import { Article } from "../models/Article.js";
import { ArticleVersion } from "../models/ArticleVersion.js";
import { ApiError } from "../utils/ApiError.js";
import { generateUniqueSlug } from "../utils/generateSlug.js";

function buildPagination(page, limit, totalItems) {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

function getSort(sort) {
  const options = {
    newest: { publishedAt: -1, createdAt: -1 },
    oldest: { publishedAt: 1, createdAt: 1 },
    recently_updated: { updatedAt: -1 },
  };

  return options[sort];
}

async function findOwnedArticle(articleId, userId, session = null) {
  const article = await Article.findById(articleId).session(session);

  if (!article) {
    throw new ApiError(404, "Article not found.", [
      {
        code: "ARTICLE_NOT_FOUND",
        message: "Article not found.",
      },
    ]);
  }

  if (article.publisher.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not allowed to modify this article.", [
      {
        code: "ARTICLE_OWNERSHIP_REQUIRED",
        message: "Only the article publisher may perform this action.",
      },
    ]);
  }

  return article;
}

export async function createArticle(userId, input) {
  const session = await mongoose.startSession();

  try {
    let createdArticle;

    await session.withTransaction(async () => {
      const slug = await generateUniqueSlug(input.title, session);

      const [article] = await Article.create(
        [
          {
            ...input,
            slug,
            publisher: userId,
            status: "draft",
            currentVersion: 1,
          },
        ],
        { session }
      );

      await ArticleVersion.create(
        [
          {
            article: article._id,
            versionNumber: 1,
            title: article.title,
            summary: article.summary,
            content: article.content,
            createdBy: userId,
            changeType: "initial",
            changeDescription: "Initial article version",
          },
        ],
        { session }
      );

      createdArticle = article;
    });

    return createdArticle;
  } finally {
    await session.endSession();
  }
}

export async function listPublishedArticles({
  page,
  limit,
  sort,
  search,
}) {
  const filter = {
    status: "published",
  };

  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.$or = [
      {
        title: {
          $regex: escapedSearch,
          $options: "i",
        },
      },
      {
        summary: {
          $regex: escapedSearch,
          $options: "i",
        },
      },
    ];
  }

  const skip = (page - 1) * limit;

  const [articles, totalItems] = await Promise.all([
    Article.find(filter)
      .populate("publisher", "name bio")
      .sort(getSort(sort))
      .skip(skip)
      .limit(limit)
      .lean(),

    Article.countDocuments(filter),
  ]);

  return {
    articles,
    pagination: buildPagination(page, limit, totalItems),
  };
}

export async function getPublishedArticleBySlug(slug) {
  const article = await Article.findOne({
    slug,
    status: "published",
  })
    .populate("publisher", "name bio")
    .lean();

  if (!article) {
    throw new ApiError(404, "Published article not found.", [
      {
        code: "ARTICLE_NOT_FOUND",
        message: "Published article not found.",
      },
    ]);
  }

  return article;
}

export async function listOwnedArticles(
  userId,
  { page, limit, sort, status }
) {
  const filter = {
    publisher: userId,
  };

  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const [articles, totalItems] = await Promise.all([
    Article.find(filter)
      .sort(getSort(sort))
      .skip(skip)
      .limit(limit)
      .lean(),

    Article.countDocuments(filter),
  ]);

  return {
    articles,
    pagination: buildPagination(page, limit, totalItems),
  };
}

export async function updateOwnedArticle(
  articleId,
  userId,
  input
) {
  const session = await mongoose.startSession();

  try {
    let updatedArticle;

    await session.withTransaction(async () => {
      const article = await findOwnedArticle(
        articleId,
        userId,
        session
      );

      const nextTitle = input.title ?? article.title;
      const nextSummary = input.summary ?? article.summary;
      const nextContent = input.content ?? article.content;

      const contentChanged =
        nextTitle !== article.title ||
        nextSummary !== article.summary ||
        nextContent !== article.content;

      if (!contentChanged) {
        throw new ApiError(400, "No article changes were provided.", [
          {
            code: "NO_ARTICLE_CHANGES",
            message: "The supplied values match the current article.",
          },
        ]);
      }

      article.title = nextTitle;
      article.summary = nextSummary;
      article.content = nextContent;
      article.currentVersion += 1;

      await article.save({ session });

      await ArticleVersion.create(
        [
          {
            article: article._id,
            versionNumber: article.currentVersion,
            title: article.title,
            summary: article.summary,
            content: article.content,
            createdBy: userId,
            changeType: "manual_edit",
            changeDescription:
              input.changeDescription || "Article manually updated",
          },
        ],
        { session }
      );

      updatedArticle = article;
    });

    return updatedArticle;
  } finally {
    await session.endSession();
  }
}

export async function publishOwnedArticle(articleId, userId) {
  const article = await findOwnedArticle(articleId, userId);

  if (article.status === "published") {
    throw new ApiError(409, "Article is already published.", [
      {
        code: "ARTICLE_ALREADY_PUBLISHED",
        message: "Article is already published.",
      },
    ]);
  }

  article.status = "published";
  article.archivedAt = null;

  if (!article.publishedAt) {
    article.publishedAt = new Date();
  }

  await article.save();

  return article;
}

export async function archiveOwnedArticle(articleId, userId) {
  const article = await findOwnedArticle(articleId, userId);

  if (article.status === "archived") {
    throw new ApiError(409, "Article is already archived.", [
      {
        code: "ARTICLE_ALREADY_ARCHIVED",
        message: "Article is already archived.",
      },
    ]);
  }

  article.status = "archived";
  article.archivedAt = new Date();

  await article.save();

  return article;
}