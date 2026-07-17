import apiClient from "./apiClient.js";

export async function fetchPublishedArticles(params = {}) {
  const response = await apiClient.get("/articles", {
    params,
  });

  return response.data.data;
}

export async function fetchPublishedArticleBySlug(slug) {
  const response = await apiClient.get(
    `/articles/${encodeURIComponent(slug)}`
  );

  return response.data.data.article;
}

export async function fetchMyArticles(params = {}) {
  const response = await apiClient.get("/articles/me", {
    params,
  });

  return response.data.data;
}

export async function createArticle(payload) {
  const response = await apiClient.post(
    "/articles",
    payload
  );

  return response.data.data.article;
}

export async function updateArticle(articleId, payload) {
  const response = await apiClient.patch(
    `/articles/${articleId}`,
    payload
  );

  return response.data.data.article;
}

export async function publishArticle(articleId) {
  const response = await apiClient.patch(
    `/articles/${articleId}/publish`
  );

  return response.data.data.article;
}

export async function archiveArticle(articleId) {
  const response = await apiClient.patch(
    `/articles/${articleId}/archive`
  );

  return response.data.data.article;
}