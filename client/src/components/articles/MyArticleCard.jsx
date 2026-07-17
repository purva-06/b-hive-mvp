import { Link } from "react-router-dom";

import ArticleStatusBadge from "./ArticleStatusBadge.jsx";
import { formatDate } from "../../utils/formatDate.js";

export default function MyArticleCard({
  article,
  onPublish,
  onArchive,
  isUpdating,
}) {
  const canPublish =
    article.status === "draft" ||
    article.status === "archived";

  const canArchive =
    article.status === "published" ||
    article.status === "draft";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-amber-300 hover:shadow-lg">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <ArticleStatusBadge status={article.status} />

          <h2 className="mt-4 text-xl font-black text-slate-950">
            {article.title}
          </h2>

          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
            {article.summary}
          </p>
        </div>

        <div className="shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
          Version {article.currentVersion}
        </div>
      </div>

      <div className="mt-5 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Created
          </p>

          <p className="mt-1 font-semibold text-slate-800">
            {formatDate(article.createdAt)}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Last updated
          </p>

          <p className="mt-1 font-semibold text-slate-800">
            {formatDate(article.updatedAt)}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-5">
        {article.status === "published" && (
          <Link
            to={`/articles/${article.slug}`}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
          >
            View article
          </Link>
        )}

        <Link
          to={`/articles/${article.id}/edit`}
          className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
        >
          Edit article
        </Link>

        <Link
          to={`/articles/${article.id}/versions`}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
        >
          Version history
        </Link>

        <Link
          to={`/articles/${article.id}/contributions`}
          className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
        >
          Review contributions
        </Link>

        {canPublish && (
          <button
            type="button"
            onClick={() => onPublish(article)}
            disabled={isUpdating}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Publish
          </button>
        )}

        {canArchive && (
          <button
            type="button"
            onClick={() => onArchive(article)}
            disabled={isUpdating}
            className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Archive
          </button>
        )}
      </div>
    </article>
  );
}