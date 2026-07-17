import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const dashboardActions = [
  {
    to: "/articles/new",
    icon: "✍️",
    title: "Create an article",
    description:
      "Publish a new knowledge article and invite others to improve it through structured contributions.",
    action: "Get started",
  },
  {
    to: "/my-articles",
    icon: "📚",
    title: "My articles",
    description:
      "Manage drafts, published articles, archived content and complete version history from one place.",
    action: "View articles",
  },
  {
    to: "/my-contributions",
    icon: "🤝",
    title: "My contributions",
    description:
      "Track submitted improvements, review feedback and monitor the status of every contribution.",
    action: "View contributions",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  const displayName =
    user?.name?.trim() ||
    user?.displayName?.trim() ||
    "there";

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white p-7 shadow-sm sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-700">
          Dashboard
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
          Welcome back, {displayName}
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          Manage your articles, review contributions and
          grow your knowledge portfolio.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to="/articles/new"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-md"
          >
            Create article
            <span aria-hidden="true">→</span>
          </Link>

          <Link
            to="/articles"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
          >
            Explore articles
          </Link>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {dashboardActions.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-xl transition group-hover:bg-amber-200">
              <span aria-hidden="true">{item.icon}</span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-amber-700">
              {item.title}
            </h2>

            <p className="mt-3 flex-1 leading-7 text-slate-600">
              {item.description}
            </p>

            <p className="mt-6 inline-flex items-center gap-2 font-semibold text-amber-700">
              {item.action}
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}