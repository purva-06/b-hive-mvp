import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import { fetchMyArticles } from "../../api/articleApi.js";

import {
  fetchArticleContributions,
} from "../../api/contributionApi.js";

import LoadingScreen from "../../components/common/LoadingScreen.jsx";
import Pagination from "../../components/common/Pagination.jsx";

import IncomingContributionCard from "../../components/contributions/IncomingContributionCard.jsx";

import { getApiError } from "../../utils/getApiError.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 6;
const ARTICLE_LOOKUP_LIMIT = 50;

const statusOptions = [
  {
    value: "",
    label: "All contributions",
  },
  {
    value: "pending",
    label: "Pending review",
  },
  {
    value: "changes_requested",
    label: "Changes requested",
  },
  {
    value: "accepted",
    label: "Accepted",
  },
  {
    value: "rejected",
    label: "Rejected",
  },
  {
    value: "withdrawn",
    label: "Withdrawn",
  },
];

async function findOwnedArticle(articleId) {
  let page = DEFAULT_PAGE;
  let hasNextPage = true;

  while (hasNextPage) {
    const data = await fetchMyArticles({
      page,
      limit: ARTICLE_LOOKUP_LIMIT,
      sort: "recently_updated",
    });

    const matchedArticle = data.articles.find(
      (item) => item.id === articleId
    );

    if (matchedArticle) {
      return matchedArticle;
    }

    hasNextPage = data.pagination.hasNextPage;
    page += 1;
  }

  return null;
}

export default function ArticleContributionsPage() {
  const { articleId } = useParams();

  const [article, setArticle] = useState(null);
  const [contributions, setContributions] =
    useState([]);

  const [pagination, setPagination] = useState({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [page, setPage] = useState(DEFAULT_PAGE);
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");

  const [isArticleLoading, setIsArticleLoading] =
    useState(true);

  const [
    isContributionsLoading,
    setIsContributionsLoading,
  ] = useState(true);

  const [articleError, setArticleError] =
    useState("");

  const [contributionsError, setContributionsError] =
    useState("");

  const [articleReloadKey, setArticleReloadKey] =
    useState(0);

  const [
    contributionsReloadKey,
    setContributionsReloadKey,
  ] = useState(0);

  const loadArticleInformation =
    useCallback(async () => {
      setIsArticleLoading(true);
      setArticleError("");

      try {
        const matchedArticle =
          await findOwnedArticle(articleId);

        if (!matchedArticle) {
          throw new Error(
            "The article could not be found in your account."
          );
        }

        setArticle(matchedArticle);
      } catch (error) {
        const apiError = getApiError(error);

        setArticleError(
          apiError.message ||
            "Unable to load the article."
        );

        setArticle(null);
      } finally {
        setIsArticleLoading(false);
      }
    }, [articleId]);

  const loadContributions = useCallback(async () => {
    setIsContributionsLoading(true);
    setContributionsError("");

    try {
      const data = await fetchArticleContributions(
        articleId,
        {
          page,
          limit: DEFAULT_LIMIT,
          sort,
          ...(status ? { status } : {}),
        }
      );

      setContributions(data.contributions);
      setPagination(data.pagination);
    } catch (error) {
      const apiError = getApiError(error);

      setContributionsError(
        apiError.message ||
          "Unable to load the contribution queue."
      );

      setContributions([]);
    } finally {
      setIsContributionsLoading(false);
    }
  }, [articleId, page, sort, status]);

  useEffect(() => {
    loadArticleInformation();
  }, [loadArticleInformation, articleReloadKey]);

  useEffect(() => {
    if (article) {
      loadContributions();
    }
  }, [
    article,
    loadContributions,
    contributionsReloadKey,
  ]);

  function handleStatusChange(event) {
    setPage(DEFAULT_PAGE);
    setStatus(event.target.value);
  }

  function handleSortChange(event) {
    setPage(DEFAULT_PAGE);
    setSort(event.target.value);
  }

  function handlePageChange(nextPage) {
    setPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleArticleRetry() {
    setArticleReloadKey(
      (current) => current + 1
    );
  }

  function handleContributionsRetry() {
    setContributionsReloadKey(
      (current) => current + 1
    );
  }

  if (isArticleLoading && !article) {
    return (
      <LoadingScreen message="Loading contribution queue..." />
    );
  }

  if (articleError && !article) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-3xl font-black text-slate-950">
            Contribution queue unavailable
          </h1>

          <p className="mt-4 text-red-700">
            {articleError}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleArticleRetry}
              disabled={isArticleLoading}
              className="rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isArticleLoading
                ? "Trying again..."
                : "Try again"}
            </button>

            <Link
              to="/my-articles"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Back to my articles
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/my-articles"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-amber-700"
      >
        ← Back to my articles
      </Link>

      <div className="mt-7 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
            Publisher review queue
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            Article contributions
          </h1>

          <p className="mt-3 max-w-3xl text-lg font-semibold text-slate-800">
            {article?.title}
          </p>

          <p className="mt-2 max-w-2xl leading-7 text-slate-600">
            Review proposed improvements, request
            revisions, reject unsuitable submissions or
            merge accepted work into the article.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Contributions
            </p>

            <p className="mt-1 text-2xl font-black text-slate-950">
              {pagination.totalItems}
            </p>
          </div>

          {article?.status === "published" && (
            <Link
              to={`/articles/${article.slug}`}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
            >
              View article
            </Link>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label
              htmlFor="incoming-contribution-status"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Filter by status
            </label>

            <select
              id="incoming-contribution-status"
              value={status}
              onChange={handleStatusChange}
              disabled={isContributionsLoading}
              className="min-w-56 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
            >
              {statusOptions.map((option) => (
                <option
                  key={option.value || "all"}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="incoming-contribution-sort"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Sort by
            </label>

            <select
              id="incoming-contribution-sort"
              value={sort}
              onChange={handleSortChange}
              disabled={isContributionsLoading}
              className="min-w-48 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
            >
              <option value="newest">
                Newest
              </option>

              <option value="oldest">
                Oldest
              </option>

              <option value="recently_updated">
                Recently updated
              </option>
            </select>
          </div>
        </div>
      </div>

      {contributionsError && (
        <div
          role="alert"
          className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5"
        >
          <p className="text-sm text-red-700">
            {contributionsError}
          </p>

          <button
            type="button"
            onClick={handleContributionsRetry}
            disabled={isContributionsLoading}
            className="mt-4 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isContributionsLoading
              ? "Trying again..."
              : "Try again"}
          </button>
        </div>
      )}

      {!contributionsError &&
        contributions.length === 0 &&
        !isContributionsLoading && (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
              📥
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              No contributions found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              {status
                ? "This article has no contributions with the selected status."
                : "No one has submitted an improvement to this article yet."}
            </p>
          </div>
        )}

      {!contributionsError &&
        contributions.length > 0 && (
          <>
            {isContributionsLoading && (
              <p className="mt-6 text-sm font-medium text-slate-500">
                Updating contribution queue...
              </p>
            )}

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {contributions.map(
                (contribution) => (
                  <IncomingContributionCard
                    key={contribution.id}
                    contribution={contribution}
                  />
                )
              )}
            </div>

            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={
                pagination.hasPreviousPage
              }
              onPageChange={handlePageChange}
              disabled={isContributionsLoading}
            />
          </>
        )}
    </section>
  );
}