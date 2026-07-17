import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import ReactMarkdown from "react-markdown";

import {
  Link,
  useParams,
} from "react-router-dom";

import { fetchArticleVersion } from "../../api/versionApi.js";

import LoadingScreen from "../../components/common/LoadingScreen.jsx";

import { formatDate } from "../../utils/formatDate.js";
import { getApiError } from "../../utils/getApiError.js";

function getAuthorName(version) {
  return (
    version.author?.name ??
    version.createdBy?.name ??
    version.contributor?.name ??
    "Unknown author"
  );
}

function getVersionNumber(version, routeVersionNumber) {
  return (
    version.versionNumber ??
    version.version ??
    version.number ??
    routeVersionNumber
  );
}

function getVersionDescription(version) {
  return (
    version.message ??
    version.changeSummary ??
    version.description ??
    "No change summary was provided for this version."
  );
}

function getArticleTitle(version) {
  return (
    version.title ??
    version.article?.title ??
    "Untitled article"
  );
}

function getArticleSummary(version) {
  return (
    version.summary ??
    version.articleSummary ??
    version.article?.summary ??
    ""
  );
}

function getArticleContent(version) {
  return (
    version.content ??
    version.articleContent ??
    version.snapshot?.content ??
    ""
  );
}

export default function VersionDetailsPage() {
  const {
    articleId,
    versionNumber: routeVersionNumber,
  } = useParams();

  const [version, setVersion] = useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [reloadKey, setReloadKey] =
    useState(0);

  const loadVersion = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchArticleVersion(
        articleId,
        routeVersionNumber
      );

      setVersion(data);
    } catch (error) {
      const apiError = getApiError(error);

      setErrorMessage(
        apiError.message ||
          "Unable to load this article version."
      );

      setVersion(null);
    } finally {
      setIsLoading(false);
    }
  }, [articleId, routeVersionNumber]);

  useEffect(() => {
    loadVersion();
  }, [loadVersion, reloadKey]);

  const displayedVersionNumber = useMemo(
    () =>
      version
        ? getVersionNumber(
            version,
            routeVersionNumber
          )
        : routeVersionNumber,
    [version, routeVersionNumber]
  );

  const title = useMemo(
    () => (version ? getArticleTitle(version) : ""),
    [version]
  );

  const summary = useMemo(
    () => (version ? getArticleSummary(version) : ""),
    [version]
  );

  const content = useMemo(
    () => (version ? getArticleContent(version) : ""),
    [version]
  );

  function handleRetry() {
    setReloadKey((current) => current + 1);
  }

  if (isLoading && !version) {
    return (
      <LoadingScreen message="Loading article version..." />
    );
  }

  if (errorMessage && !version) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl">
            !
          </div>

          <h1 className="mt-5 text-3xl font-black text-slate-950">
            Could not load version
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-red-700">
            {errorMessage}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleRetry}
              disabled={isLoading}
              className="rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading
                ? "Trying again..."
                : "Try again"}
            </button>

            <Link
              to={`/articles/${articleId}/versions`}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Back to version history
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to={`/articles/${articleId}/versions`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-amber-700"
      >
        ← Back to version history
      </Link>

      <header className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
              Archived snapshot
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
              Version {displayedVersionNumber}
            </h1>

            <p className="mt-3 text-xl font-bold text-slate-800">
              {title}
            </p>
          </div>

          <span className="w-fit rounded-full bg-slate-950 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
            Read-only version
          </span>
        </div>

        <div className="mt-7 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Version
            </p>

            <p className="mt-1 font-bold text-slate-950">
              {displayedVersionNumber}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Created by
            </p>

            <p className="mt-1 font-bold text-slate-950">
              {getAuthorName(version)}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Created
            </p>

            <p className="mt-1 font-bold text-slate-950">
              {version.createdAt
                ? formatDate(version.createdAt)
                : "Date unavailable"}
            </p>
          </div>
        </div>
      </header>

      <section className="mt-7 rounded-3xl border border-amber-200 bg-amber-50 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
          Change summary
        </p>

        <p className="mt-3 leading-7 text-amber-950">
          {getVersionDescription(version)}
        </p>
      </section>

      {version.source && (
        <section className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
            Version source
          </p>

          <p className="mt-2 font-semibold text-blue-950">
            {version.source}
          </p>
        </section>
      )}

      {version.contribution && (
        <section className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
            Accepted contribution
          </p>

          <p className="mt-2 leading-6 text-emerald-950">
            {version.contribution.message ??
              version.contribution.changeSummary ??
              "This version was created from an accepted contribution."}
          </p>
        </section>
      )}

      {summary && (
        <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            Article summary
          </p>

          <p className="mt-3 text-lg leading-8 text-slate-700">
            {summary}
          </p>
        </section>
      )}

      <article className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="border-b border-slate-200 pb-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            Version content
          </p>

          <p className="mt-2 text-sm text-slate-600">
            This is a preserved, read-only snapshot of the
            article at version {displayedVersionNumber}.
          </p>
        </div>

        {content ? (
          <div className="prose prose-slate mt-8 max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <h2 className="font-bold text-slate-950">
              No content available
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              This version does not contain a stored
              article snapshot.
            </p>
          </div>
        )}
      </article>

      <div className="mt-8 flex flex-wrap justify-between gap-3">
        <Link
          to={`/articles/${articleId}/versions`}
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
        >
          View all versions
        </Link>

        {version.article?.slug && (
          <Link
            to={`/articles/${version.article.slug}`}
            className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-amber-300"
          >
            View current article
          </Link>
        )}
      </div>
    </section>
  );
}