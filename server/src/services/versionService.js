import {
  ARTICLE_STATUS,
} from "../constants/articleConstants.js";

import { Article } from "../models/Article.js";
import { ArticleVersion } from "../models/ArticleVersion.js";

import { ApiError } from "../utils/ApiError.js";

import {
  buildPagination,
  getPaginationValues,
} from "../utils/pagination.js";

const VERSION_SORT = Object.freeze({
  NEWEST: "newest",
  OLDEST: "oldest",
});

function getVersionSort(sort) {
  const options = {
    [VERSION_SORT.NEWEST]: {
      versionNumber: -1,
    },

    [VERSION_SORT.OLDEST]: {
      versionNumber: 1,
    },
  };

  return options[sort] ?? options[VERSION_SORT.NEWEST];
}

async function findArticleForVersionAccess(
  articleId,
  userId = null
) {
  const article = await Article.findById(articleId).lean();

  if (!article) {
    throw new ApiError(404, "Article not found.", [
      {
        code: "ARTICLE_NOT_FOUND",
        message: "Article not found.",
      },
    ]);
  }

  const isPublisher =
    userId &&
    article.publisher.toString() === userId.toString();

  const isPubliclyVisible =
    article.status === ARTICLE_STATUS.PUBLISHED;

  if (!isPubliclyVisible && !isPublisher) {
    throw new ApiError(
      403,
      "You are not allowed to view this article's version history.",
      [
        {
          code: "VERSION_HISTORY_ACCESS_DENIED",
          message:
            "Only the publisher may view versions of a private article.",
        },
      ]
    );
  }

  return article;
}

export async function listArticleVersions(
  articleId,
  userId,
  query = {}
) {
  const article = await findArticleForVersionAccess(
    articleId,
    userId
  );

  const {
    page,
    limit,
    skip,
  } = getPaginationValues(query);

  const {
    sort = VERSION_SORT.NEWEST,
  } = query;

  const filter = {
    article: article._id,
  };

  const [versions, totalItems] = await Promise.all([
    ArticleVersion.find(filter)
      .select(
        [
          "article",
          "versionNumber",
          "createdBy",
          "approvedBy",
          "sourceContribution",
          "changeType",
          "changeDescription",
          "createdAt",
        ].join(" ")
      )
      .populate("createdBy", "name bio")
      .populate("approvedBy", "name bio")
      .sort(getVersionSort(sort))
      .skip(skip)
      .limit(limit)
      .lean(),

    ArticleVersion.countDocuments(filter),
  ]);

  return {
    article: {
      id: article._id,
      title: article.title,
      slug: article.slug,
      status: article.status,
      currentVersion: article.currentVersion,
    },

    versions,

    pagination: buildPagination({
      page,
      limit,
      totalItems,
    }),
  };
}

export async function getArticleVersion(
  articleId,
  versionNumber,
  userId
) {
  const article = await findArticleForVersionAccess(
    articleId,
    userId
  );

  const version = await ArticleVersion.findOne({
    article: article._id,
    versionNumber,
  })
    .populate("createdBy", "name bio")
    .populate("approvedBy", "name bio")
    .populate(
      "sourceContribution",
      "contributor message status reviewedAt"
    )
    .lean();

  if (!version) {
    throw new ApiError(404, "Article version not found.", [
      {
        code: "ARTICLE_VERSION_NOT_FOUND",
        message:
          `Version ${versionNumber} was not found for this article.`,
      },
    ]);
  }

  return version;
}