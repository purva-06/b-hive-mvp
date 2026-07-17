import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { fetchPublishedArticles } from "../../api/articleApi.js";
import ArticleCard from "../../components/articles/ArticleCard.jsx";
import LoadingScreen from "../../components/common/LoadingScreen.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import { getApiError } from "../../utils/getApiError.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 6;

export default function ArticlesPage() {
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
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchPublishedArticles({
        page,
        limit: DEFAULT_LIMIT,
        sort,
        ...(search ? { search } : {}),
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
  }, [page, search, sort]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles, reloadKey]);

  function handleSearchSubmit(event) {
    event.preventDefault();

    const normalizedSearch = searchInput.trim();

    setPage(DEFAULT_PAGE);
    setSearch(normalizedSearch);
  }

  function handleClearSearch() {
    setSearchInput("");
    setPage(DEFAULT_PAGE);
    setSearch("");
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

  function handleRetry() {
    setReloadKey((current) => current + 1);
  }

  if (isLoading && articles.length === 0 && !errorMessage) {
    return (
      <LoadingScreen message="Loading articles..." />
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
            Explore knowledge
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            Published articles
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Discover published knowledge, follow how it
            evolves, and propose structured improvements.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Available articles
          </p>

          <p className="mt-1 text-2xl font-black text-slate-950">
            {pagination.totalItems}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <form
            onSubmit={handleSearchSubmit}
            className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-2xl"
          >
            <label
              htmlFor="article-search"
              className="sr-only"
            >
              Search articles
            </label>

            <input
              id="article-search"
              type="search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              placeholder="Search by title or summary..."
              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Search
            </button>

            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                disabled={isLoading}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear
              </button>
            )}
          </form>

          <div className="flex items-center gap-3">
            <label
              htmlFor="article-sort"
              className="text-sm font-semibold text-slate-600"
            >
              Sort by
            </label>

            <select
              id="article-sort"
              value={sort}
              onChange={handleSortChange}
              disabled={isLoading}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
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

      {errorMessage && (
        <div
          role="alert"
          className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5"
        >
          <h2 className="font-bold text-red-800">
            Could not load articles
          </h2>

          <p className="mt-1 text-sm text-red-700">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={handleRetry}
            disabled={isLoading}
            className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Trying again..." : "Try again"}
          </button>
        </div>
      )}

      {!errorMessage && articles.length === 0 && (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
            📄
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-950">
            No articles found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            {search
              ? "Try using a different search term."
              : "No articles have been published yet."}
          </p>

          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              disabled={isLoading}
              className="mt-5 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Show all articles
            </button>
          )}
        </div>
      )}

      {!errorMessage && articles.length > 0 && (
        <>
          {isLoading && (
            <p className="mt-6 text-sm font-medium text-slate-500">
              Updating results...
            </p>
          )}

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
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