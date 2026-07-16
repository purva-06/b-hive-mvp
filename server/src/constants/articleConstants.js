export const ARTICLE_STATUS = Object.freeze({
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
});

export const ARTICLE_STATUSES = Object.freeze(
  Object.values(ARTICLE_STATUS)
);

export const ARTICLE_VERSION_CHANGE_TYPE = Object.freeze({
  INITIAL: "initial",
  MANUAL_EDIT: "manual_edit",
  ACCEPTED_CONTRIBUTION: "accepted_contribution",
});

export const ARTICLE_VERSION_CHANGE_TYPES = Object.freeze(
  Object.values(ARTICLE_VERSION_CHANGE_TYPE)
);

export const ARTICLE_SORT = Object.freeze({
  NEWEST: "newest",
  OLDEST: "oldest",
  RECENTLY_UPDATED: "recently_updated",
});

export const ARTICLE_SORT_OPTIONS = Object.freeze(
  Object.values(ARTICLE_SORT)
);