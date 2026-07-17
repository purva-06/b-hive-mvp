import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const workflowSteps = [
  {
    number: "01",
    icon: "📝",
    title: "Publish knowledge",
    description:
      "Create structured articles using Markdown and share your knowledge with the community.",
  },
  {
    number: "02",
    icon: "🤝",
    title: "Improve together",
    description:
      "Readers can propose complete, reviewable improvements without directly changing the article.",
  },
  {
    number: "03",
    icon: "📜",
    title: "Preserve every version",
    description:
      "Accepted changes create a traceable version history with attribution and context.",
  },
];

const features = [
  "Structured contribution workflow",
  "Publisher review and approval",
  "Complete version history",
  "Contributor attribution",
  "Markdown article support",
  "Draft, published and archived states",
];

export default function HomePage() {
  const { user, isInitializing } = useAuth();

  const isAuthenticated = Boolean(user);

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-50 via-white to-slate-50"
        />

        <div
          aria-hidden="true"
          className="absolute -right-32 -top-32 -z-10 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl"
        />

        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-28">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-amber-200 bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900">
              Git-inspired knowledge collaboration
            </p>

            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Publish knowledge.
              <br />
              <span className="text-amber-600">
                Improve it together.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              B HIVE lets people publish articles,
              propose structured improvements, review
              contributions and preserve complete version
              history.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/articles"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 font-semibold text-slate-950 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-lg active:translate-y-0"
              >
                Explore articles
                <span aria-hidden="true">→</span>
              </Link>

              {!isInitializing &&
                (isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 hover:shadow-md"
                  >
                    Go to dashboard
                    <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 hover:shadow-md"
                  >
                    Create an account
                    <span aria-hidden="true">→</span>
                  </Link>
                ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-600">
                  Collaborative article
                </p>

                <h2 className="mt-2 text-xl font-black text-slate-950">
                  Understanding REST APIs
                </h2>
              </div>

              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                Published
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Current version
                </p>

                <div className="mt-2 flex items-center justify-between gap-4">
                  <p className="font-bold text-slate-900">
                    Version 4
                  </p>

                  <span className="text-sm font-semibold text-emerald-700">
                    Latest
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                  New contribution
                </p>

                <p className="mt-2 text-sm leading-6 text-amber-950">
                  Clarifies HTTP methods and adds an
                  authentication example.
                </p>

                <div className="mt-4 flex gap-2">
                  <span className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">
                    Accept
                  </span>

                  <span className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-800">
                    Request changes
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-950 p-4 text-white">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Contributors
                  </p>

                  <p className="mt-1 font-bold">
                    8 collaborators
                  </p>
                </div>

                <span className="text-2xl" aria-hidden="true">
                  🤝
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
            How it works
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            A clear workflow for collaborative knowledge
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            Every improvement is proposed, reviewed and
            recorded instead of silently replacing the
            original work.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {workflowSteps.map((step) => (
            <article
              key={step.number}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-xl">
                  <span aria-hidden="true">
                    {step.icon}
                  </span>
                </div>

                <span className="text-sm font-black text-slate-300">
                  {step.number}
                </span>
              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-950">
                {step.title}
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
              Built for traceability
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Knowledge should improve without losing its
              history
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-slate-600">
              B HIVE combines publishing, peer
              contribution and version control in one
              transparent workflow.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-700"
                >
                  ✓
                </span>

                <p className="font-semibold text-slate-800">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-950 px-6 py-12 text-center text-white sm:px-10">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            Start building knowledge together
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">
            Explore published articles or create your own
            workspace for collaborative improvement.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <Link
              to="/articles"
              className="rounded-xl bg-amber-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-amber-300"
            >
              Browse articles
            </Link>

            {!isInitializing &&
              (isAuthenticated ? (
                <Link
                  to="/articles/new"
                  className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white transition hover:border-slate-500 hover:bg-slate-900"
                >
                  Create an article
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white transition hover:border-slate-500 hover:bg-slate-900"
                >
                  Join B HIVE
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}