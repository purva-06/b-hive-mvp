import apiClient from "./apiClient.js";

export async function submitContribution(articleId, payload) {
  const response = await apiClient.post(
    `/articles/${articleId}/contributions`,
    payload
  );

  return response.data.data.contribution;
}

export async function fetchMyContributions(params = {}) {
  const response = await apiClient.get("/contributions/me", {
    params,
  });

  return response.data.data;
}

export async function fetchArticleContributions(
  articleId,
  params = {}
) {
  const response = await apiClient.get(
    `/articles/${articleId}/contributions`,
    {
      params,
    }
  );

  return response.data.data;
}

export async function fetchContributionById(contributionId) {
  const response = await apiClient.get(
    `/contributions/${contributionId}`
  );

  return response.data.data.contribution;
}

export async function requestContributionChanges(
  contributionId,
  reviewComment
) {
  const response = await apiClient.patch(
    `/contributions/${contributionId}/request-changes`,
    {
      reviewComment,
    }
  );

  return response.data.data.contribution;
}

export async function rejectContribution(
  contributionId,
  reviewComment
) {
  const response = await apiClient.patch(
    `/contributions/${contributionId}/reject`,
    {
      reviewComment,
    }
  );

  return response.data.data.contribution;
}

export async function acceptContribution(
  contributionId,
  reviewComment = ""
) {
  const response = await apiClient.patch(
    `/contributions/${contributionId}/accept`,
    {
      reviewComment,
    }
  );

  return response.data.data;
}

export async function withdrawContribution(contributionId) {
  const response = await apiClient.patch(
    `/contributions/${contributionId}/withdraw`
  );

  return response.data.data.contribution;
}

export async function resubmitContribution(
  contributionId,
  payload
) {
  const response = await apiClient.patch(
    `/contributions/${contributionId}/resubmit`,
    payload
  );

  return response.data.data.contribution;
}