import mongoose from "mongoose";

import { Article } from "../models/Article.js";
import { ArticleVersion } from "../models/ArticleVersion.js";
import { Contribution } from "../models/Contribution.js";

import {
  ARTICLE_STATUS,
  ARTICLE_VERSION_CHANGE_TYPE,
} from "../constants/articleConstants.js";

import {
  ACTIVE_CONTRIBUTION_STATUSES,
  CONTRIBUTION_SORT,
  CONTRIBUTION_STATUS,
} from "../constants/contributionConstants.js";

import { ApiError } from "../utils/ApiError.js";

import {
  buildPagination,
  getPaginationValues,
} from "../utils/pagination.js";

function getContributionSort(sort) {
  const options = {
    [CONTRIBUTION_SORT.NEWEST]: {
      createdAt: -1,
    },
    [CONTRIBUTION_SORT.OLDEST]: {
      createdAt: 1,
    },
    [CONTRIBUTION_SORT.RECENTLY_UPDATED]: {
      updatedAt: -1,
    },
  };

  return options[sort] ?? options[CONTRIBUTION_SORT.NEWEST];
}

function normalizeComparableContent(content) {
  return content.replace(/\s+/g, " ").trim();
}

async function findContribution(contributionId, session = null) {
  const contribution = await Contribution.findById(
    contributionId
  ).session(session);

  if (!contribution) {
    throw new ApiError(404, "Contribution not found.", [
      {
        code: "CONTRIBUTION_NOT_FOUND",
        message: "Contribution not found.",
      },
    ]);
  }

  return contribution;
}

async function findRelatedArticle(articleId, session = null) {
  const article = await Article.findById(articleId).session(session);

  if (!article) {
    throw new ApiError(404, "Article not found.", [
      {
        code: "ARTICLE_NOT_FOUND",
        message: "Article not found.",
      },
    ]);
  }

  return article;
}

async function verifyReviewPermission(
  contribution,
  userId,
  session = null
) {
  const article = await findRelatedArticle(
    contribution.article,
    session
  );

  if (article.publisher.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      "You are not allowed to review this contribution.",
      [
        {
          code: "ARTICLE_OWNERSHIP_REQUIRED",
          message:
            "Only the article publisher may review this contribution.",
        },
      ]
    );
  }

  return article;
}

export async function submitContribution(
  articleId,
  userId,
  input
) {
  const article = await findRelatedArticle(articleId);

  if (article.status !== ARTICLE_STATUS.PUBLISHED) {
    throw new ApiError(
      422,
      "This article is not open for contributions.",
      [
        {
          code: "ARTICLE_NOT_OPEN_FOR_CONTRIBUTIONS",
          message:
            "Only published articles may receive contributions.",
        },
      ]
    );
  }

  if (article.publisher.toString() === userId.toString()) {
    throw new ApiError(
      403,
      "You cannot contribute to your own article.",
      [
        {
          code: "SELF_CONTRIBUTION_NOT_ALLOWED",
          message:
            "Use the article edit endpoint to update your own article.",
        },
      ]
    );
  }

  const currentContent = normalizeComparableContent(article.content);

  const proposedContent = normalizeComparableContent(
    input.proposedContent
  );

  if (currentContent === proposedContent) {
    throw new ApiError(
      400,
      "The proposed content contains no meaningful changes.",
      [
        {
          field: "proposedContent",
          code: "NO_MEANINGFUL_CHANGES",
          message:
            "The proposed content must differ from the current article.",
        },
      ]
    );
  }

  const existingActiveContribution =
    await Contribution.findOne({
      article: article._id,
      contributor: userId,
      status: {
        $in: ACTIVE_CONTRIBUTION_STATUSES,
      },
    }).lean();

  if (existingActiveContribution) {
    throw new ApiError(
      409,
      "You already have an active contribution for this article.",
      [
        {
          code: "ACTIVE_CONTRIBUTION_EXISTS",
          message:
            "Resolve or withdraw the existing contribution first.",
        },
      ]
    );
  }

  return Contribution.create({
    article: article._id,
    contributor: userId,
    baseVersion: article.currentVersion,
    originalContent: article.content,
    proposedContent: input.proposedContent,
    message: input.message,
    status: CONTRIBUTION_STATUS.PENDING,
  });
}

export async function listMyContributions(userId, query) {
  const { page, limit, skip } = getPaginationValues(query);

  const {
    sort = CONTRIBUTION_SORT.NEWEST,
    status,
  } = query;

  const filter = {
    contributor: userId,
  };

  if (status) {
    filter.status = status;
  }

  const [contributions, totalItems] = await Promise.all([
    Contribution.find(filter)
      .populate({
        path: "article",
        select:
          "title slug publisher currentVersion status",
        populate: {
          path: "publisher",
          select: "name bio",
        },
      })
      .sort(getContributionSort(sort))
      .skip(skip)
      .limit(limit)
      .lean(),

    Contribution.countDocuments(filter),
  ]);

  return {
    contributions,
    pagination: buildPagination({
      page,
      limit,
      totalItems,
    }),
  };
}

export async function listArticleContributions(
  articleId,
  userId,
  query
) {
  const article = await findRelatedArticle(articleId);

  if (article.publisher.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      "You are not allowed to view these contributions.",
      [
        {
          code: "ARTICLE_OWNERSHIP_REQUIRED",
          message:
            "Only the article publisher may view its contribution queue.",
        },
      ]
    );
  }

  const { page, limit, skip } = getPaginationValues(query);

  const {
    sort = CONTRIBUTION_SORT.NEWEST,
    status,
  } = query;

  const filter = {
    article: article._id,
  };

  if (status) {
    filter.status = status;
  }

  const [contributions, totalItems] = await Promise.all([
    Contribution.find(filter)
      .populate("contributor", "name bio")
      .sort(getContributionSort(sort))
      .skip(skip)
      .limit(limit)
      .select("-originalContent -proposedContent")
      .lean(),

    Contribution.countDocuments(filter),
  ]);

  return {
    contributions,
    pagination: buildPagination({
      page,
      limit,
      totalItems,
    }),
  };
}

export async function getContributionDetails(
  contributionId,
  userId
) {
  const contribution = await Contribution.findById(
    contributionId
  )
    .populate("contributor", "name bio")
    .populate("reviewedBy", "name")
    .populate(
      "article",
      "title slug publisher currentVersion status"
    );

  if (!contribution) {
    throw new ApiError(404, "Contribution not found.", [
      {
        code: "CONTRIBUTION_NOT_FOUND",
        message: "Contribution not found.",
      },
    ]);
  }

  const contributorId =
    contribution.contributor._id.toString();

  const articlePublisherId =
    contribution.article.publisher.toString();

  const isContributor = contributorId === userId.toString();

  const isPublisher =
    articlePublisherId === userId.toString();

  if (!isContributor && !isPublisher) {
    throw new ApiError(
      403,
      "You are not allowed to view this contribution.",
      [
        {
          code: "CONTRIBUTION_ACCESS_DENIED",
          message:
            "Only the contributor or article publisher may view it.",
        },
      ]
    );
  }

  return contribution;
}

export async function requestContributionChanges(
  contributionId,
  userId,
  reviewComment
) {
  const contribution = await findContribution(
    contributionId
  );

  await verifyReviewPermission(contribution, userId);

  if (
    contribution.status !== CONTRIBUTION_STATUS.PENDING
  ) {
    throw new ApiError(
      409,
      "Changes can only be requested for a pending contribution.",
      [
        {
          code: "INVALID_CONTRIBUTION_STATUS",
          message:
            "The contribution is not currently pending.",
        },
      ]
    );
  }

  contribution.status =
    CONTRIBUTION_STATUS.CHANGES_REQUESTED;

  contribution.reviewComment = reviewComment;
  contribution.reviewedBy = userId;
  contribution.reviewedAt = new Date();

  await contribution.save();

  return contribution;
}

export async function resubmitContribution(
  contributionId,
  userId,
  input
) {
  const contribution = await findContribution(
    contributionId
  );

  if (
    contribution.contributor.toString() !==
    userId.toString()
  ) {
    throw new ApiError(
      403,
      "You are not allowed to resubmit this contribution.",
      [
        {
          code: "CONTRIBUTION_OWNERSHIP_REQUIRED",
          message:
            "Only the original contributor may resubmit it.",
        },
      ]
    );
  }

  if (
    contribution.status !==
    CONTRIBUTION_STATUS.CHANGES_REQUESTED
  ) {
    throw new ApiError(
      409,
      "This contribution is not awaiting revision.",
      [
        {
          code: "INVALID_CONTRIBUTION_STATUS",
          message:
            "Only contributions with requested changes may be resubmitted.",
        },
      ]
    );
  }

  const article = await findRelatedArticle(
    contribution.article
  );

  if (
    contribution.baseVersion !== article.currentVersion
  ) {
    throw new ApiError(
      409,
      "The article changed after this contribution was submitted.",
      [
        {
          code: "ARTICLE_VERSION_CONFLICT",
          message:
            "Create a new proposal from the latest article version.",
        },
      ]
    );
  }

  const proposedContent = normalizeComparableContent(
    input.proposedContent
  );

  const originalContent = normalizeComparableContent(
    contribution.originalContent
  );

  if (proposedContent === originalContent) {
    throw new ApiError(
      400,
      "The revised content contains no meaningful changes.",
      [
        {
          field: "proposedContent",
          code: "NO_MEANINGFUL_CHANGES",
          message:
            "The proposal must differ from the original article.",
        },
      ]
    );
  }

  contribution.proposedContent =
    input.proposedContent;

  contribution.message = input.message;
  contribution.status = CONTRIBUTION_STATUS.PENDING;
  contribution.reviewedBy = null;
  contribution.reviewedAt = null;
  contribution.resubmissionCount += 1;

  await contribution.save();

  return contribution;
}

export async function withdrawContribution(
  contributionId,
  userId
) {
  const contribution = await findContribution(
    contributionId
  );

  if (
    contribution.contributor.toString() !==
    userId.toString()
  ) {
    throw new ApiError(
      403,
      "You are not allowed to withdraw this contribution.",
      [
        {
          code: "CONTRIBUTION_OWNERSHIP_REQUIRED",
          message:
            "Only the original contributor may withdraw it.",
        },
      ]
    );
  }

  if (
    !ACTIVE_CONTRIBUTION_STATUSES.includes(
      contribution.status
    )
  ) {
    throw new ApiError(
      409,
      "This contribution cannot be withdrawn.",
      [
        {
          code: "INVALID_CONTRIBUTION_STATUS",
          message:
            "Only active contributions may be withdrawn.",
        },
      ]
    );
  }

  contribution.status = CONTRIBUTION_STATUS.WITHDRAWN;

  await contribution.save();

  return contribution;
}

export async function rejectContribution(
  contributionId,
  userId,
  reviewComment
) {
  const contribution = await findContribution(
    contributionId
  );

  await verifyReviewPermission(contribution, userId);

  if (
    contribution.status !== CONTRIBUTION_STATUS.PENDING
  ) {
    throw new ApiError(
      409,
      "Only pending contributions may be rejected.",
      [
        {
          code: "INVALID_CONTRIBUTION_STATUS",
          message:
            "The contribution is not currently pending.",
        },
      ]
    );
  }

  contribution.status = CONTRIBUTION_STATUS.REJECTED;
  contribution.reviewComment = reviewComment;
  contribution.reviewedBy = userId;
  contribution.reviewedAt = new Date();

  await contribution.save();

  return contribution;
}

export async function acceptContribution(
  contributionId,
  userId,
  reviewComment = ""
) {
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const contribution = await findContribution(
        contributionId,
        session
      );

      if (
        contribution.status !== CONTRIBUTION_STATUS.PENDING
      ) {
        throw new ApiError(
          409,
          "Only pending contributions may be accepted.",
          [
            {
              code: "INVALID_CONTRIBUTION_STATUS",
              message:
                "The contribution is not currently pending.",
            },
          ]
        );
      }

      const article = await verifyReviewPermission(
        contribution,
        userId,
        session
      );

      if (article.status !== ARTICLE_STATUS.PUBLISHED) {
        throw new ApiError(
          422,
          "The article is not in an acceptable state.",
          [
            {
              code: "ARTICLE_NOT_OPEN_FOR_CONTRIBUTIONS",
              message:
                "Only published articles may accept contributions.",
            },
          ]
        );
      }

      if (
        contribution.baseVersion !==
        article.currentVersion
      ) {
        throw new ApiError(
          409,
          "The article changed after this contribution was submitted.",
          [
            {
              code: "ARTICLE_VERSION_CONFLICT",
              message:
                "Review the contribution against the latest article version.",
              details: {
                baseVersion: contribution.baseVersion,
                currentVersion: article.currentVersion,
              },
            },
          ]
        );
      }

      const proposedContent =
        normalizeComparableContent(
          contribution.proposedContent
        );

      const currentContent =
        normalizeComparableContent(article.content);

      if (proposedContent === currentContent) {
        throw new ApiError(
          409,
          "The article already contains the proposed content.",
          [
            {
              code: "NO_MERGE_CHANGES",
              message:
                "The accepted proposal would not change the article.",
            },
          ]
        );
      }

      article.content = contribution.proposedContent;
      article.currentVersion += 1;

      await article.save({ session });

      const [version] = await ArticleVersion.create(
        [
          {
            article: article._id,
            versionNumber: article.currentVersion,
            title: article.title,
            summary: article.summary,
            content: article.content,
            createdBy: contribution.contributor,
            approvedBy: userId,
            sourceContribution: contribution._id,
            changeType:
              ARTICLE_VERSION_CHANGE_TYPE.ACCEPTED_CONTRIBUTION,
            changeDescription: contribution.message,
          },
        ],
        { session }
      );

      contribution.status =
        CONTRIBUTION_STATUS.ACCEPTED;

      contribution.reviewComment = reviewComment;
      contribution.reviewedBy = userId;
      contribution.reviewedAt = new Date();

      await contribution.save({ session });

      result = {
        article,
        contribution,
        version,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
}