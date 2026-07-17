import { Link } from "react-router-dom";

import { formatDate } from "../../utils/formatDate.js";

export default function ArticleCard({ article }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
          Published
        </span>

        <span className="text-xs font-medium text-slate-500">
          Version {article.currentVersion}
        </span>
      </div>

      <h2 className="mt-5 text-xl font-bold leading-snug text-slate-950 transition-colors group-hover:text-amber-700">
        {article.title}
      </h2>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
        {article.summary}
      </p>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
          {article.publisher?.name
            ?.slice(0, 1)
            .toUpperCase() ?? "U"}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800">
            {article.publisher?.name ?? "Unknown publisher"}
          </p>

          <p className="text-xs text-slate-500">
            Published {formatDate(article.publishedAt)}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <Link
          to={`/articles/${article.slug}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 transition hover:text-amber-800"
        >
          Read article
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      </div>
    </article>
  );
}