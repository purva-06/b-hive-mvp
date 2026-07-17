import {
  useCallback,
  useEffect,
  useState,
} from "react";

import ReactMarkdown from "react-markdown";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  fetchPublishedArticleBySlug,
} from "../../api/articleApi.js";

import LoadingScreen from "../../components/common/LoadingScreen.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { formatDate } from "../../utils/formatDate.js";
import { getApiError } from "../../utils/getApiError.js";

export default function ArticleDetailsPage() {
  const { slug } = useParams();
  const {
    user,
    isAuthenticated,
  } = useAuth();

  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadArticle = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchPublishedArticleBySlug(slug);
      setArticle(data);
    } catch (error) {
      const apiError = getApiError(error);

      setErrorMessage(apiError.message);
      setArticle(null);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadArticle();
  }, [loadArticle]);

  if (isLoading) {
    return (
      <LoadingScreen message="Loading article..." />
    );
  }

  if (errorMessage || !article) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-600">
            Article unavailable
          </p>

          <h1 className="mt-3 text-3xl font-black text-slate-950">
            We could not load this article
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-red-700">
            {errorMessage ||
              "The requested article could not be found."}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={loadArticle}
              className="rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-600"
            >
              Try again
            </button>

            <Link
              to="/articles"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Back to articles
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const publisherId =
    typeof article.publisher === "object"
      ? article.publisher?.id
      : article.publisher;

  const isPublisher =
    Boolean(user?.id) &&
    Boolean(publisherId) &&
    user.id === publisherId;

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/articles"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-amber-700"
      >
        <span aria-hidden="true">←</span>
        Back to articles
      </Link>

      <header className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
            Published
          </span>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Version {article.currentVersion}
          </span>
        </div>

        <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
          {article.title}
        </h1>

        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
          {article.summary}
        </p>

        <div className="mt-8 flex flex-col justify-between gap-6 border-t border-slate-200 pt-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-950 text-base font-black text-white">
              {article.publisher?.name
                ?.slice(0, 1)
                .toUpperCase() ?? "U"}
            </div>

            <div>
              <p className="font-bold text-slate-900">
                {article.publisher?.name ??
                  "Unknown publisher"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Published{" "}
                {formatDate(article.publishedAt)}
                {" · "}
                Updated{" "}
                {formatDate(article.updatedAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={`/articles/${article.id}/versions`}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
            >
              View version history
            </Link>

            {!isPublisher && (
              <Link
                to={
                  isAuthenticated
                    ? `/articles/${article.id}/contribute`
                    : "/login"
                }
                state={
                  !isAuthenticated
                    ? {
                        from: `/articles/${article.slug}`,
                      }
                    : undefined
                }
                className="rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-md"
              >
                Suggest an improvement
              </Link>
            )}

            {isPublisher && (
              <Link
                to="/my-articles"
                className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Manage article
              </Link>
            )}
          </div>
        </div>
      </header>

      <article className="mt-8 rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10">
        <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-950 prose-a:text-amber-700 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-amber-400 prose-blockquote:bg-amber-50 prose-blockquote:px-5 prose-blockquote:py-2 prose-code:rounded prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-slate-800 prose-pre:bg-slate-950">
          <ReactMarkdown>
            {article.content}
          </ReactMarkdown>
        </div>
      </article>

      <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-7 sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-700">
              Collaborative knowledge
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Found something worth improving?
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
              Propose a structured revision. The publisher
              can review it, request changes, or merge it
              while preserving your attribution.
            </p>
          </div>

          {!isPublisher ? (
            <Link
              to={
                isAuthenticated
                  ? `/articles/${article.id}/contribute`
                  : "/login"
              }
              state={
                !isAuthenticated
                  ? {
                      from: `/articles/${article.slug}`,
                    }
                  : undefined
              }
              className="shrink-0 rounded-xl bg-slate-950 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Suggest an improvement
            </Link>
          ) : (
            <p className="shrink-0 rounded-xl border border-amber-300 bg-white px-5 py-3 text-sm font-semibold text-amber-800">
              You published this article
            </p>
          )}
        </div>
      </section>
    </section>
  );
}