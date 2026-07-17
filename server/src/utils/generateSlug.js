import { Article } from "../models/Article.js";

function normalizeSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function generateUniqueSlug(title, session = null) {
  const baseSlug = normalizeSlug(title) || "article";

  let slug = baseSlug;
  let suffix = 2;

  while (await Article.exists({ slug }).session(session)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}