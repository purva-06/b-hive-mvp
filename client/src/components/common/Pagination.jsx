export default function Pagination({
  page,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  disabled = false,
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
      <p className="text-sm text-slate-500">
        Page{" "}
        <span className="font-semibold text-slate-800">
          {page}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-800">
          {totalPages}
        </span>
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!hasPreviousPage || disabled}
          onClick={() => onPageChange(page - 1)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Previous
        </button>

        <button
          type="button"
          disabled={!hasNextPage || disabled}
          onClick={() => onPageChange(page + 1)}
          className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}