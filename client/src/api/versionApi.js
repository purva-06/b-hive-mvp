import apiClient from "./apiClient.js";

export async function fetchArticleVersions(
  articleId,
  params = {}
) {
  const response = await apiClient.get(
    `/articles/${encodeURIComponent(
      articleId
    )}/versions`,
    {
      params,
    }
  );

  return response.data.data;
}

export async function fetchArticleVersion(
  articleId,
  versionNumber
) {
  const response = await apiClient.get(
    `/articles/${encodeURIComponent(
      articleId
    )}/versions/${encodeURIComponent(
      versionNumber
    )}`
  );

  return response.data.data.version;
}