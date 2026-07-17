export const CONTRIBUTION_STATUS = Object.freeze({
  PENDING: "pending",
  CHANGES_REQUESTED: "changes_requested",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
});

export const CONTRIBUTION_STATUSES = Object.freeze(
  Object.values(CONTRIBUTION_STATUS)
);

export const ACTIVE_CONTRIBUTION_STATUSES = Object.freeze([
  CONTRIBUTION_STATUS.PENDING,
  CONTRIBUTION_STATUS.CHANGES_REQUESTED,
]);

export const CONTRIBUTION_SORT = Object.freeze({
  NEWEST: "newest",
  OLDEST: "oldest",
  RECENTLY_UPDATED: "recently_updated",
});

export const CONTRIBUTION_SORT_OPTIONS = Object.freeze(
  Object.values(CONTRIBUTION_SORT)
);