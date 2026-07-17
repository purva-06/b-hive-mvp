import {
  getArticleVersion,
  listArticleVersions,
} from "../services/versionService.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

import {
  serializeResource,
  serializeResources,
} from "../utils/serializeResource.js";

export const listVersions = asyncHandler(
  async (req, res) => {
    const result = await listArticleVersions(
      req.params.articleId,
      req.user?._id ?? null,
      req.validated.query
    );

    return sendSuccess(res, {
      message:
        result.versions.length > 0
          ? "Article versions retrieved successfully."
          : "No article versions found.",
      data: {
        article: serializeResource(result.article),

        versions: serializeResources(
          result.versions
        ),

        pagination: result.pagination,
      },
    });
  }
);

export const getVersion = asyncHandler(
  async (req, res) => {
    const version = await getArticleVersion(
      req.params.articleId,
      req.validated.params.versionNumber,
      req.user?._id ?? null
    );

    return sendSuccess(res, {
      message:
        "Article version retrieved successfully.",
      data: {
        version: serializeResource(version),
      },
    });
  }
);