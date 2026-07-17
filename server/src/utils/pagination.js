import { ApiError } from "./ApiError.js";

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 50;

export function getPaginationValues(query = {}) {
  const page = Number(query.page ?? DEFAULT_PAGE);
  const limit = Number(query.limit ?? DEFAULT_LIMIT);

  if (!Number.isInteger(page) || page < 1) {
    throw new ApiError(400, "Invalid page value.", [
      {
        field: "page",
        code: "INVALID_PAGE",
        message: "Page must be a positive integer.",
      },
    ]);
  }

  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > MAX_LIMIT
  ) {
    throw new ApiError(400, "Invalid limit value.", [
      {
        field: "limit",
        code: "INVALID_LIMIT",
        message: `Limit must be between 1 and ${MAX_LIMIT}.`,
      },
    ]);
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function buildPagination({
  page,
  limit,
  totalItems,
}) {
  const totalPages =
    totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1 && totalPages > 0,
  };
}