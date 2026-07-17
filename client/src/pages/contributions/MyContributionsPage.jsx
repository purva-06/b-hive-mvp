import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  fetchMyContributions,
} from "../../api/contributionApi.js";

import ContributionCard from "../../components/contributions/ContributionCard.jsx";
import LoadingScreen from "../../components/common/LoadingScreen.jsx";
import Pagination from "../../components/common/Pagination.jsx";

import { getApiError } from "../../utils/getApiError.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 6;

const filterOptions = [
  {
    value: "",
    label: "All contributions",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "changes_requested",
    label: "Changes requested",
  },
  {
    value: "accepted",
    label: "Accepted",
  },
  {
    value: "rejected",
    label: "Rejected",
  },
  {
    value: "withdrawn",
    label: "Withdrawn",
  },
];

export default function MyContributionsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [contributions, setContributions] =
    useState([]);

  const [pagination, setPagination] = useState({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [page, setPage] = useState(DEFAULT_PAGE);
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState(
      location.state?.submittedContributionId
        ? "Your proposal is now waiting for the publisher’s review."
        : ""
    );

  const [reloadKey, setReloadKey] =
    useState(0);

  const loadContributions = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchMyContributions({
        page,
        limit: DEFAULT_LIMIT,
        sort,
        ...(status ? { status } : {}),
      });

      setContributions(data.contributions);
      setPagination(data.pagination);
    } catch (error) {
      const apiError = getApiError(error);

      setErrorMessage(apiError.message);
      setContributions([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, sort, status]);

  useEffect(() => {
    loadContributions();
  }, [loadContributions, reloadKey]);

  useEffect(() => {
    if (location.state?.submittedContributionId) {
      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }
  }, [
    location.pathname,
    location.state,
    navigate,
  ]);

  function handleStatusChange(event) {
    setPage(DEFAULT_PAGE);
    setStatus(event.target.value);
    setSuccessMessage("");
  }

  function handleSortChange(event) {
    setPage(DEFAULT_PAGE);
    setSort(event.target.value);
    setSuccessMessage("");
  }

  function handlePageChange(nextPage) {
    setPage(nextPage);
    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleRetry() {
    setReloadKey((current) => current + 1);
  }

  if (
    isLoading &&
    contributions.length === 0 &&
    !errorMessage
  ) {
    return (
      <LoadingScreen message="Loading your contributions..." />
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
            Contribution portfolio
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            My contributions
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Track every proposed improvement, reviewer
            response and accepted contribution.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Total contributions
          </p>

          <p className="mt-1 text-2xl font-black text-slate-950">
            {pagination.totalItems}
          </p>
        </div>
      </div>

      {successMessage && (
        <div
          role="status"
          className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
        >
          <p className="font-bold text-emerald-900">
            Contribution submitted successfully
          </p>

          <p className="mt-1 text-sm text-emerald-700">
            {successMessage}
          </p>

          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="mt-3 text-sm font-semibold text-emerald-800 underline-offset-4 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <label
              htmlFor="contribution-status"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Filter by status
            </label>

            <select
              id="contribution-status"
              value={status}
              onChange={handleStatusChange}
              disabled={isLoading}
              className="min-w-56 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
            >
              {filterOptions.map((option) => (
                <option
                  key={option.value || "all"}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="contribution-sort"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Sort by
            </label>

            <select
              id="contribution-sort"
              value={sort}
              onChange={handleSortChange}
              disabled={isLoading}
              className="min-w-48 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
            >
              <option value="newest">
                Newest
              </option>

              <option value="oldest">
                Oldest
              </option>

              <option value="recently_updated">
                Recently updated
              </option>
            </select>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5"
        >
          <h2 className="font-bold text-red-800">
            Could not load contributions
          </h2>

          <p className="mt-1 text-sm text-red-700">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={handleRetry}
            disabled={isLoading}
            className="mt-4 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading
              ? "Trying again..."
              : "Try again"}
          </button>
        </div>
      )}

      {!errorMessage &&
        contributions.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
              🤝
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              No contributions found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              {status
                ? "You do not have any contributions with this status."
                : "Browse a published article and suggest your first improvement."}
            </p>

            {!status && (
              <Link
                to="/articles"
                className="mt-5 inline-flex rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
              >
                Browse articles
              </Link>
            )}
          </div>
        )}

      {!errorMessage &&
        contributions.length > 0 && (
          <>
            {isLoading && (
              <p className="mt-6 text-sm font-medium text-slate-500">
                Updating contributions...
              </p>
            )}

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {contributions.map(
                (contribution) => (
                  <ContributionCard
                    key={contribution.id}
                    contribution={contribution}
                  />
                )
              )}
            </div>

            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={
                pagination.hasPreviousPage
              }
              onPageChange={handlePageChange}
              disabled={isLoading}
            />
          </>
        )}
    </section>
  );
}