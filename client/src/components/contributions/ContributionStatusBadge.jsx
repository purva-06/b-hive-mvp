const statusStyles = {
  pending:
    "border-amber-200 bg-amber-50 text-amber-800",

  changes_requested:
    "border-blue-200 bg-blue-50 text-blue-800",

  accepted:
    "border-emerald-200 bg-emerald-50 text-emerald-800",

  rejected:
    "border-red-200 bg-red-50 text-red-800",

  withdrawn:
    "border-slate-200 bg-slate-100 text-slate-700",
};

const statusLabels = {
  pending: "Pending review",
  changes_requested: "Changes requested",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export default function ContributionStatusBadge({
  status,
}) {
  const className =
    statusStyles[status] ??
    "border-slate-200 bg-slate-100 text-slate-700";

  const label =
    statusLabels[status] ?? status ?? "Unknown";

  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}