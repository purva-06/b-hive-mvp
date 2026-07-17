import { Link } from "react-router-dom";

import { formatDate } from "../../utils/formatDate.js";
import ContributionStatusBadge from "./ContributionStatusBadge.jsx";

export default function IncomingContributionCard({
  contribution,
}) {
  const contributor =
    typeof contribution.contributor === "object"
      ? contribution.contributor
      : null;

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <ContributionStatusBadge
            status={contribution.status}
          />

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">
              {contributor?.name
                ?.slice(0, 1)
                .toUpperCase() ?? "U"}
            </div>

            <div>
              <h2 className="font-bold text-slate-950">
                {contributor?.name ??
                  "Unknown contributor"}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Submitted{" "}
                {formatDate(contribution.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
          Based on version {contribution.baseVersion}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          Contributor message
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-700">
          {contribution.message}
        </p>
      </div>

      {contribution.reviewComment && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
            Review comment
          </p>

          <p className="mt-2 text-sm leading-6 text-blue-900">
            {contribution.reviewComment}
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-col justify-between gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center">
        <p className="text-xs text-slate-500">
          {contribution.resubmissionCount > 0
            ? `Resubmitted ${
                contribution.resubmissionCount
              } ${
                contribution.resubmissionCount === 1
                  ? "time"
                  : "times"
              }`
            : "Original submission"}
        </p>

        <Link
          to={`/contributions/${contribution.id}`}
          className={[
            "rounded-xl px-4 py-2 text-center text-sm font-bold transition",
            contribution.status === "pending"
              ? "bg-amber-400 text-slate-950 hover:bg-amber-300"
              : "bg-slate-950 text-white hover:bg-slate-800",
          ].join(" ")}
        >
          {contribution.status === "pending"
            ? "Review contribution"
            : "View details"}
        </Link>
      </div>
    </article>
  );
}