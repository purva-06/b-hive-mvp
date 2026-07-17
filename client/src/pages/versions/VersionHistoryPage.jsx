import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import LoadingScreen from "../../components/common/LoadingScreen.jsx";
import Pagination from "../../components/common/Pagination.jsx";

import { formatDate } from "../../utils/formatDate.js";
import { getApiError } from "../../utils/getApiError.js";
import { fetchArticleVersions } from "../../api/versionApi.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 8;

function getAuthorName(version) {
  return (
    version.author?.name ??
    version.createdBy?.name ??
    version.contributor?.name ??
    "Unknown author"
  );
}

function getVersionDescription(version) {
  return (
    version.message ??
    version.changeSummary ??
    version.summary ??
    version.description ??
    "No version description was provided."
  );
}

export default function VersionHistoryPage() {
  const { articleId } = useParams();

  const [article, setArticle] = useState(null);
  const [versions, setVersions] = useState([]);

  const [pagination, setPagination] = useState({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [page, setPage] = useState(DEFAULT_PAGE);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [reloadKey, setReloadKey] =
    useState(0);

  const loadVersions = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchArticleVersions(
        articleId,
        {
          page,
          limit: DEFAULT_LIMIT,
        }
      );

      setArticle(data.article ?? null);
      setVersions(data.versions ?? []);
      setPagination(
        data.pagination ?? {
          page,
          limit: DEFAULT_LIMIT,
          totalItems: data.versions?.length ?? 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (error) {
      const apiError = getApiError(error);

      setErrorMessage(
        apiError.message ||
          "Unable to load version history."
      );

      setVersions([]);
    } finally {
      setIsLoading(false);
    }
  }, [articleId, page]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions, reloadKey]);

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

  if (
    isLoading &&
    versions.length === 0 &&
    !errorMessage
  ) {
    return (
      <LoadingScreen message="Loading version history..." />
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to={
          article?.slug
            ? `/articles/${article.slug}`
            : "/my-articles"
        }
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-amber-700"
      >
        ← Back to article
      </Link>

      <div className="mt-7 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
            Article timeline
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            Version history
          </h1>

          <p className="mt-3 max-w-3xl text-lg font-semibold text-slate-800">
            {article?.title ??
              "Article version history"}
          </p>

          <p className="mt-2 max-w-2xl leading-7 text-slate-600">
            Review how this article has evolved over
            time, who made each change and why a new
            version was created.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Total versions
          </p>

          <p className="mt-1 text-2xl font-black text-slate-950">
            {pagination.totalItems}
          </p>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5"
        >
          <h2 className="font-bold text-red-800">
            Could not load version history
          </h2>

          <p className="mt-1 text-sm text-red-700">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={handleRetry}
            disabled={isLoading}
            className="mt-4 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading
              ? "Trying again..."
              : "Try again"}
          </button>
        </div>
      )}

      {!errorMessage &&
        versions.length === 0 &&
        !isLoading && (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
              🕘
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              No versions found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              This article does not have any recorded
              versions yet.
            </p>
          </div>
        )}

      {!errorMessage &&
        versions.length > 0 && (
          <>
            {isLoading && (
              <p className="mt-6 text-sm font-medium text-slate-500">
                Updating version history...
              </p>
            )}

            <div className="relative mt-10">
              <div className="absolute bottom-0 left-5 top-0 hidden w-px bg-slate-200 sm:block" />

              <div className="space-y-6">
                {versions.map((version, index) => {
                  const versionNumber =
                    version.versionNumber ??
                    version.version ??
                    version.number;

                  const isCurrentVersion =
  version.isCurrent === true ||
  versionNumber === article?.currentVersion;

                  return (
                    <article
                      key={
                        version.id ??
                        version._id ??
                        versionNumber
                      }
                      className="relative sm:pl-14"
                    >
                      <div className="absolute left-0 top-6 hidden h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-amber-400 text-sm font-black text-slate-950 shadow-sm sm:flex">
                        {versionNumber}
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-amber-300 hover:shadow-md sm:p-7">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
                                Version {versionNumber}
                              </span>

                              {isCurrentVersion && (
                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                                  Current version
                                </span>
                              )}

                              {version.source && (
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                                  {version.source}
                                </span>
                              )}
                            </div>

                            <h2 className="mt-4 text-xl font-black text-slate-950">
                              {version.title ??
                                `Article version ${versionNumber}`}
                            </h2>

                            <p className="mt-2 text-sm text-slate-600">
                              Created by{" "}
                              <span className="font-semibold text-slate-900">
                                {getAuthorName(version)}
                              </span>
                              {version.createdAt && (
                                <>
                                  {" · "}
                                  {formatDate(
                                    version.createdAt
                                  )}
                                </>
                              )}
                            </p>
                          </div>

                          <Link
                            to={`/articles/${articleId}/versions/${versionNumber}`}
                            className="shrink-0 rounded-xl border border-slate-300 bg-white px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
                          >
                            View version
                          </Link>
                        </div>

                        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                            Change summary
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {getVersionDescription(
                              version
                            )}
                          </p>
                        </div>

                        {version.contribution && (
                          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
                              Created from accepted
                              contribution
                            </p>

                            <p className="mt-2 text-sm leading-6 text-amber-900">
                              {version.contribution
                                .message ??
                                "This version was created by merging an accepted contribution."}
                            </p>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
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