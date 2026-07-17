import { Link } from "react-router-dom";

import { formatDate } from "../../utils/formatDate.js";
import ContributionStatusBadge from "./ContributionStatusBadge.jsx";

export default function ContributionCard({
  contribution,
}) {
  const article =
    typeof contribution.article === "object"
      ? contribution.article
      : null;

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <ContributionStatusBadge
            status={contribution.status}
          />

          <h2 className="mt-4 text-xl font-bold text-slate-950 transition-colors group-hover:text-amber-700">
            {article?.title ??
              "Article unavailable"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Submitted{" "}
            {formatDate(contribution.createdAt)}
          </p>
        </div>

        <div className="shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
          Based on version{" "}
          {contribution.baseVersion}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          Contribution message
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-700">
          {contribution.message}
        </p>
      </div>

      {contribution.reviewComment && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
            Reviewer feedback
          </p>

          <p className="mt-2 text-sm leading-6 text-blue-900">
            {contribution.reviewComment}
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-col justify-between gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center">
        <div className="text-xs text-slate-500">
          {contribution.resubmissionCount > 0 && (
            <span>
              Resubmitted{" "}
              {contribution.resubmissionCount}{" "}
              {contribution.resubmissionCount === 1
                ? "time"
                : "times"}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {article?.slug && (
            <Link
              to={`/articles/${article.slug}`}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
            >
              View article
            </Link>
          )}

          <Link
            to={`/contributions/${contribution.id}`}
            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}