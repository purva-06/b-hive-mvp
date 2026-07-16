import {
  acceptContribution,
  getContributionDetails,
  listArticleContributions,
  listMyContributions,
  rejectContribution,
  requestContributionChanges,
  resubmitContribution,
  submitContribution,
  withdrawContribution,
} from "../services/contributionService.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

import {
  serializeResource,
  serializeResources,
} from "../utils/serializeResource.js";

export const submit = asyncHandler(async (req, res) => {
  const contribution = await submitContribution(
    req.params.articleId,
    req.user._id,
    req.body
  );

  return sendSuccess(res, {
    statusCode: 201,
    message: "Contribution submitted successfully.",
    data: {
      contribution: serializeResource(contribution),
    },
  });
});

export const listMine = asyncHandler(async (req, res) => {
  const result = await listMyContributions(
    req.user._id,
    req.validated.query
  );

  return sendSuccess(res, {
    message:
      result.contributions.length > 0
        ? "Contributions retrieved successfully."
        : "No contributions found.",
    data: {
      contributions: serializeResources(
        result.contributions
      ),
      pagination: result.pagination,
    },
  });
});

export const listForArticle = asyncHandler(
  async (req, res) => {
    const result = await listArticleContributions(
      req.params.articleId,
      req.user._id,
      req.validated.query
    );

    return sendSuccess(res, {
      message:
        result.contributions.length > 0
          ? "Article contributions retrieved successfully."
          : "No contributions found.",
      data: {
        contributions: serializeResources(
          result.contributions
        ),
        pagination: result.pagination,
      },
    });
  }
);

export const getOne = asyncHandler(async (req, res) => {
  const contribution = await getContributionDetails(
    req.params.contributionId,
    req.user._id
  );

  return sendSuccess(res, {
    message: "Contribution retrieved successfully.",
    data: {
      contribution: serializeResource(contribution),
    },
  });
});

export const requestChanges = asyncHandler(
  async (req, res) => {
    const contribution =
      await requestContributionChanges(
        req.params.contributionId,
        req.user._id,
        req.body.reviewComment
      );

    return sendSuccess(res, {
      message: "Changes requested successfully.",
      data: {
        contribution: serializeResource(contribution),
      },
    });
  }
);

export const resubmit = asyncHandler(async (req, res) => {
  const contribution = await resubmitContribution(
    req.params.contributionId,
    req.user._id,
    req.body
  );

  return sendSuccess(res, {
    message: "Contribution resubmitted successfully.",
    data: {
      contribution: serializeResource(contribution),
    },
  });
});

export const withdraw = asyncHandler(async (req, res) => {
  const contribution = await withdrawContribution(
    req.params.contributionId,
    req.user._id
  );

  return sendSuccess(res, {
    message: "Contribution withdrawn successfully.",
    data: {
      contribution: serializeResource(contribution),
    },
  });
});

export const reject = asyncHandler(async (req, res) => {
  const contribution = await rejectContribution(
    req.params.contributionId,
    req.user._id,
    req.body.reviewComment
  );

  return sendSuccess(res, {
    message: "Contribution rejected successfully.",
    data: {
      contribution: serializeResource(contribution),
    },
  });
});

export const accept = asyncHandler(async (req, res) => {
  const result = await acceptContribution(
    req.params.contributionId,
    req.user._id,
    req.body.reviewComment
  );

  return sendSuccess(res, {
    message:
      "Contribution accepted and merged successfully.",
    data: {
      article: serializeResource(result.article),
      contribution: serializeResource(
        result.contribution
      ),
      version: serializeResource(result.version),
    },
  });
});