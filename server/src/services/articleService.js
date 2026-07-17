import mongoose from "mongoose";

import {
  ARTICLE_SORT,
  ARTICLE_STATUS,
  ARTICLE_VERSION_CHANGE_TYPE,
} from "../constants/articleConstants.js";

import { Article } from "../models/Article.js";
import { ArticleVersion } from "../models/ArticleVersion.js";

import { ApiError } from "../utils/ApiError.js";
import { generateUniqueSlug } from "../utils/generateSlug.js";

import {
  buildPagination,
  getPaginationValues,
} from "../utils/pagination.js";

function getArticleSort(sort) {
  const options = {
    [ARTICLE_SORT.NEWEST]: {
      publishedAt: -1,
      createdAt: -1,
    },

    [ARTICLE_SORT.OLDEST]: {
      publishedAt: 1,
      createdAt: 1,
    },

    [ARTICLE_SORT.RECENTLY_UPDATED]: {
      updatedAt: -1,
    },
  };

  return options[sort] ?? options[ARTICLE_SORT.NEWEST];
}

function escapeRegularExpression(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findOwnedArticle(
  articleId,
  userId,
  session = null
) {
  const articleQuery = Article.findById(articleId);

  if (session) {
    articleQuery.session(session);
  }

  const article = await articleQuery;

  if (!article) {
    throw new ApiError(404, "Article not found.", [
      {
        code: "ARTICLE_NOT_FOUND",
        message: "Article not found.",
      },
    ]);
  }

  if (
    article.publisher.toString() !==
    userId.toString()
  ) {
    throw new ApiError(
      403,
      "You are not allowed to modify this article.",
      [
        {
          code: "ARTICLE_OWNERSHIP_REQUIRED",
          message:
            "Only the article publisher may perform this action.",
        },
      ]
    );
  }

  return article;
}

export async function createArticle(userId, input) {
  const session = await mongoose.startSession();

  try {
    let createdArticle;

    await session.withTransaction(async () => {
      const slug = await generateUniqueSlug(
        input.title,
        session
      );

      const [article] = await Article.create(
        [
          {
            title: input.title,
            summary: input.summary,
            content: input.content,
            slug,
            publisher: userId,
            status: ARTICLE_STATUS.DRAFT,
            currentVersion: 1,
          },
        ],
        {
          session,
        }
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
            approvedBy: null,
            sourceContribution: null,
            changeType:
              ARTICLE_VERSION_CHANGE_TYPE.INITIAL,
            changeDescription:
              "Initial article version",
          },
        ],
        {
          session,
        }
      );

      createdArticle = article;
    });

    return createdArticle;
  } finally {
    await session.endSession();
  }
}

export async function listPublishedArticles(
  query = {}
) {
  const {
    page,
    limit,
    skip,
  } = getPaginationValues(query);

  const {
    sort = ARTICLE_SORT.NEWEST,
    search,
  } = query;

  const filter = {
    status: ARTICLE_STATUS.PUBLISHED,
  };

  if (search) {
    const escapedSearch =
      escapeRegularExpression(search);

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

  const [articles, totalItems] =
    await Promise.all([
      Article.find(filter)
        .populate("publisher", "name bio")
        .sort(getArticleSort(sort))
        .skip(skip)
        .limit(limit)
        .lean(),

      Article.countDocuments(filter),
    ]);

  return {
    articles,
    pagination: buildPagination({
      page,
      limit,
      totalItems,
    }),
  };
}

export async function getPublishedArticleBySlug(
  slug
) {
  const article = await Article.findOne({
    slug,
    status: ARTICLE_STATUS.PUBLISHED,
  })
    .populate("publisher", "name bio")
    .lean();

  if (!article) {
    throw new ApiError(
      404,
      "Published article not found.",
      [
        {
          code: "ARTICLE_NOT_FOUND",
          message:
            "Published article not found.",
        },
      ]
    );
  }

  return article;
}

export async function listOwnedArticles(
  userId,
  query = {}
) {
  const {
    page,
    limit,
    skip,
  } = getPaginationValues(query);

  const {
    sort = ARTICLE_SORT.NEWEST,
    status,
  } = query;

  const filter = {
    publisher: userId,
  };

  if (status) {
    filter.status = status;
  }

  const [articles, totalItems] =
    await Promise.all([
      Article.find(filter)
        .sort(getArticleSort(sort))
        .skip(skip)
        .limit(limit)
        .lean(),

      Article.countDocuments(filter),
    ]);

  return {
    articles,
    pagination: buildPagination({
      page,
      limit,
      totalItems,
    }),
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

      const nextTitle =
        input.title ?? article.title;

      const nextSummary =
        input.summary ?? article.summary;

      const nextContent =
        input.content ?? article.content;

      const articleChanged =
        nextTitle !== article.title ||
        nextSummary !== article.summary ||
        nextContent !== article.content;

      if (!articleChanged) {
        throw new ApiError(
          400,
          "No article changes were provided.",
          [
            {
              code: "NO_ARTICLE_CHANGES",
              message:
                "The supplied values match the current article.",
            },
          ]
        );
      }

      article.title = nextTitle;
      article.summary = nextSummary;
      article.content = nextContent;
      article.currentVersion += 1;

      await article.save({
        session,
      });

      await ArticleVersion.create(
        [
          {
            article: article._id,
            versionNumber:
              article.currentVersion,
            title: article.title,
            summary: article.summary,
            content: article.content,
            createdBy: userId,
            approvedBy: null,
            sourceContribution: null,
            changeType:
              ARTICLE_VERSION_CHANGE_TYPE.MANUAL_EDIT,
            changeDescription:
              input.changeDescription ||
              "Article manually updated",
          },
        ],
        {
          session,
        }
      );

      updatedArticle = article;
    });

    return updatedArticle;
  } finally {
    await session.endSession();
  }
}

export async function publishOwnedArticle(
  articleId,
  userId
) {
  const article = await findOwnedArticle(
    articleId,
    userId
  );

  if (
    article.status === ARTICLE_STATUS.PUBLISHED
  ) {
    throw new ApiError(
      409,
      "Article is already published.",
      [
        {
          code: "ARTICLE_ALREADY_PUBLISHED",
          message:
            "Article is already published.",
        },
      ]
    );
  }

  article.status = ARTICLE_STATUS.PUBLISHED;
  article.archivedAt = null;

  if (!article.publishedAt) {
    article.publishedAt = new Date();
  }

  await article.save();

  return article;
}

export async function archiveOwnedArticle(
  articleId,
  userId
) {
  const article = await findOwnedArticle(
    articleId,
    userId
  );

  if (
    article.status === ARTICLE_STATUS.ARCHIVED
  ) {
    throw new ApiError(
      409,
      "Article is already archived.",
      [
        {
          code: "ARTICLE_ALREADY_ARCHIVED",
          message:
            "Article is already archived.",
        },
      ]
    );
  }

  article.status = ARTICLE_STATUS.ARCHIVED;
  article.archivedAt = new Date();

  await article.save();

  return article;
}