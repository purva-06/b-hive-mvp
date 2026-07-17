import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  archiveArticle,
  fetchMyArticles,
  publishArticle,
} from "../../api/articleApi.js";

import MyArticleCard from "../../components/articles/MyArticleCard.jsx";
import LoadingScreen from "../../components/common/LoadingScreen.jsx";
import Pagination from "../../components/common/Pagination.jsx";

import { getApiError } from "../../utils/getApiError.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 6;

const statusOptions = [
  { value: "", label: "All articles" },
  { value: "draft", label: "Drafts" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export default function MyArticlesPage() {
  const [articles, setArticles] = useState([]);

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

  const [isLoading, setIsLoading] = useState(true);
  const [updatingArticleId, setUpdatingArticleId] =
    useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const [reloadKey, setReloadKey] = useState(0);

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchMyArticles({
        page,
        limit: DEFAULT_LIMIT,
        sort,
        ...(status ? { status } : {}),
      });

      setArticles(data.articles);
      setPagination(data.pagination);
    } catch (error) {
      const apiError = getApiError(error);

      setErrorMessage(apiError.message);
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, sort, status]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles, reloadKey]);

  function handleStatusChange(event) {
    setSuccessMessage("");
    setPage(DEFAULT_PAGE);
    setStatus(event.target.value);
  }

  function handleSortChange(event) {
    setSuccessMessage("");
    setPage(DEFAULT_PAGE);
    setSort(event.target.value);
  }

  function handlePageChange(nextPage) {
    setSuccessMessage("");
    setPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleRetry() {
    setReloadKey((current) => current + 1);
  }

  async function handlePublish(article) {
    const confirmed = window.confirm(
      `Publish "${article.title}"?`
    );

    if (!confirmed) {
      return;
    }

    setUpdatingArticleId(article.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await publishArticle(article.id);

      setSuccessMessage(
        `"${article.title}" was published successfully.`
      );

      setReloadKey((current) => current + 1);
    } catch (error) {
      const apiError = getApiError(error);

      setErrorMessage(apiError.message);
    } finally {
      setUpdatingArticleId(null);
    }
  }

  async function handleArchive(article) {
    const confirmed = window.confirm(
      `Archive "${article.title}"?`
    );

    if (!confirmed) {
      return;
    }

    setUpdatingArticleId(article.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await archiveArticle(article.id);

      setSuccessMessage(
        `"${article.title}" was archived successfully.`
      );

      setReloadKey((current) => current + 1);
    } catch (error) {
      const apiError = getApiError(error);

      setErrorMessage(apiError.message);
    } finally {
      setUpdatingArticleId(null);
    }
  }

  if (isLoading && articles.length === 0 && !errorMessage) {
    return (
      <LoadingScreen message="Loading your articles..." />
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
            Publisher workspace
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            My articles
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Manage drafts, publish knowledge, review
            contributions and track version history.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Total articles
            </p>

            <p className="mt-1 text-2xl font-black text-slate-950">
              {pagination.totalItems}
            </p>
          </div>

          <Link
            to="/articles/new"
            className="rounded-xl bg-amber-400 px-5 py-3 text-center text-sm font-bold text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-md"
          >
            Create article
          </Link>
        </div>
      </div>

      {successMessage && (
        <div
          role="status"
          className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800"
        >
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5"
        >
          <p className="text-sm text-red-700">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={handleRetry}
            disabled={isLoading}
            className="mt-4 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Trying again..." : "Try again"}
          </button>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <div>
            <label
              htmlFor="article-status-filter"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Filter by status
            </label>

            <select
              id="article-status-filter"
              value={status}
              onChange={handleStatusChange}
              disabled={isLoading}
              className="min-w-52 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
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
              htmlFor="my-articles-sort"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Sort by
            </label>

            <select
              id="my-articles-sort"
              value={sort}
              onChange={handleSortChange}
              disabled={isLoading}
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

      {!errorMessage && articles.length === 0 && (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
            📚
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-950">
            No articles found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            {status
              ? "You do not have any articles with this status."
              : "Create your first article to begin publishing and receiving contributions."}
          </p>

          {!status && (
            <Link
              to="/articles/new"
              className="mt-5 inline-flex rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
            >
              Create your first article
            </Link>
          )}
        </div>
      )}

      {!errorMessage && articles.length > 0 && (
        <>
          {isLoading && (
            <p className="mt-6 text-sm font-medium text-slate-500">
              Updating articles...
            </p>
          )}

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {articles.map((article) => (
              <MyArticleCard
                key={article.id}
                article={article}
                onPublish={handlePublish}
                onArchive={handleArchive}
                isUpdating={
                  updatingArticleId === article.id
                }
              />
            ))}
          </div>

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            hasNextPage={pagination.hasNextPage}
            hasPreviousPage={
              pagination.hasPreviousPage
            }
            onPageChange={handlePageChange}
            disabled={isLoading}
          />
        </>
      )}
    </section>
  );
}