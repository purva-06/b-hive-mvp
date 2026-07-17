import {
  Link,
  useNavigate,
} from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-20 sm:px-6">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-3xl">
          <span aria-hidden="true">🔍</span>
        </div>

        <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-amber-600">
          Error 404
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
          Page not found
        </h1>

        <p className="mx-auto mt-4 max-w-lg leading-7 text-slate-600">
          The page may have been moved, deleted or the
          address may be incorrect.
        </p>

        <div className="mt-8 flex flex-col-reverse justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            ← Go back
          </button>

          <Link
            to="/"
            className="rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            Return home
          </Link>

          <Link
            to="/articles"
            className="rounded-xl bg-amber-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-amber-300"
          >
            Explore articles
          </Link>
        </div>
      </div>
    </section>
  );
}