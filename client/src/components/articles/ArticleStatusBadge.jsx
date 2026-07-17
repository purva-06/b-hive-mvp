const statusStyles = {
  draft:
    "border-slate-200 bg-slate-100 text-slate-700",
  published:
    "border-emerald-200 bg-emerald-50 text-emerald-800",
  archived:
    "border-red-200 bg-red-50 text-red-700",
};

const statusLabels = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export default function ArticleStatusBadge({ status }) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
        statusStyles[status] ??
          "border-slate-200 bg-slate-100 text-slate-700",
      ].join(" ")}
    >
      {statusLabels[status] ?? status ?? "Unknown"}
    </span>
  );
}