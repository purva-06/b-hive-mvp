import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import ReactMarkdown from "react-markdown";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  acceptContribution,
  fetchContributionById,
  rejectContribution,
  requestContributionChanges,
  resubmitContribution,
  withdrawContribution,
} from "../../api/contributionApi.js";

import LoadingScreen from "../../components/common/LoadingScreen.jsx";
import ContributionStatusBadge from "../../components/contributions/ContributionStatusBadge.jsx";

import { useAuth } from "../../context/AuthContext.jsx";
import { formatDate } from "../../utils/formatDate.js";
import { getApiError } from "../../utils/getApiError.js";

const REVIEW_ACTIONS = {
  NONE: "",
  REQUEST_CHANGES: "request_changes",
  REJECT: "reject",
  ACCEPT: "accept",
};

function getEntityId(entity) {
  if (!entity) {
    return null;
  }

  if (typeof entity === "string") {
    return entity;
  }

  return entity.id ?? entity._id ?? null;
}

export default function ContributionReviewPage() {
  const { contributionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [contribution, setContribution] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [selectedAction, setSelectedAction] = useState(
    REVIEW_ACTIONS.NONE
  );

  const [reviewComment, setReviewComment] =
    useState("");

  const [revisedContent, setRevisedContent] =
    useState("");

  const [resubmissionMessage, setResubmissionMessage] =
    useState("");

  const [fieldErrors, setFieldErrors] =
    useState({});

  const loadContribution = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchContributionById(
        contributionId
      );

      setContribution(data);
      setRevisedContent(data.proposedContent ?? "");
      setResubmissionMessage(data.message ?? "");
    } catch (error) {
      const apiError = getApiError(error);

      setErrorMessage(apiError.message);
      setContribution(null);
    } finally {
      setIsLoading(false);
    }
  }, [contributionId]);

  useEffect(() => {
    loadContribution();
  }, [loadContribution]);

  const contributorId = useMemo(
    () => getEntityId(contribution?.contributor),
    [contribution]
  );

  const publisherId = useMemo(
    () =>
      getEntityId(contribution?.article?.publisher),
    [contribution]
  );

  const isContributor =
    Boolean(user?.id) &&
    Boolean(contributorId) &&
    user.id === contributorId;

  const isPublisher =
    Boolean(user?.id) &&
    Boolean(publisherId) &&
    user.id === publisherId;

  const isPending =
    contribution?.status === "pending";

  const isChangesRequested =
    contribution?.status === "changes_requested";

  const canWithdraw =
    isContributor &&
    ["pending", "changes_requested"].includes(
      contribution?.status
    );

  const canResubmit =
    isContributor && isChangesRequested;

  const canReview =
    isPublisher && isPending;

  function clearMessages() {
    setErrorMessage("");
    setSuccessMessage("");
    setFieldErrors({});
  }

  function openReviewAction(action) {
    clearMessages();
    setSelectedAction(action);
    setReviewComment("");
  }

  function cancelReviewAction() {
    setSelectedAction(REVIEW_ACTIONS.NONE);
    setReviewComment("");
    setFieldErrors({});
  }

  function validateReviewComment() {
    const errors = {};
    const normalizedComment = reviewComment.trim();

    if (
      [
        REVIEW_ACTIONS.REQUEST_CHANGES,
        REVIEW_ACTIONS.REJECT,
      ].includes(selectedAction)
    ) {
      if (!normalizedComment) {
        errors.reviewComment =
          "A review comment is required.";
      } else if (normalizedComment.length < 5) {
        errors.reviewComment =
          "The review comment must contain at least 5 characters.";
      }
    }

    if (normalizedComment.length > 1000) {
      errors.reviewComment =
        "The review comment cannot exceed 1000 characters.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleReviewSubmit(event) {
    event.preventDefault();

    if (!validateReviewComment()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const normalizedComment =
        reviewComment.trim();

      if (
        selectedAction ===
        REVIEW_ACTIONS.REQUEST_CHANGES
      ) {
        const updated =
          await requestContributionChanges(
            contributionId,
            normalizedComment
          );

        setContribution(updated);
        setSuccessMessage(
          "Changes were requested successfully."
        );
      }

      if (
        selectedAction === REVIEW_ACTIONS.REJECT
      ) {
        const updated = await rejectContribution(
          contributionId,
          normalizedComment
        );

        setContribution(updated);
        setSuccessMessage(
          "The contribution was rejected."
        );
      }

      if (
        selectedAction === REVIEW_ACTIONS.ACCEPT
      ) {
        const result = await acceptContribution(
          contributionId,
          normalizedComment
        );

        setContribution(result.contribution);
        setSuccessMessage(
          `Contribution accepted. The article is now version ${result.article.currentVersion}.`
        );
      }

      setSelectedAction(REVIEW_ACTIONS.NONE);
      setReviewComment("");
    } catch (error) {
      const apiError = getApiError(error);

      setErrorMessage(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleWithdraw() {
    const shouldWithdraw = window.confirm(
      "Withdraw this contribution? It cannot be resubmitted after withdrawal."
    );

    if (!shouldWithdraw) {
      return;
    }

    clearMessages();
    setIsSubmitting(true);

    try {
      const updated = await withdrawContribution(
        contributionId
      );

      setContribution(updated);
      setSuccessMessage(
        "Contribution withdrawn successfully."
      );
    } catch (error) {
      const apiError = getApiError(error);

      setErrorMessage(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function validateResubmission() {
    const errors = {};

    if (!revisedContent.trim()) {
      errors.revisedContent =
        "Revised content is required.";
    } else if (revisedContent.trim().length < 50) {
      errors.revisedContent =
        "Revised content must contain at least 50 characters.";
    } else if (
      revisedContent.trim() ===
      contribution.originalContent?.trim()
    ) {
      errors.revisedContent =
        "The revised content must differ from the original article.";
    }

    if (!resubmissionMessage.trim()) {
      errors.resubmissionMessage =
        "A contribution message is required.";
    } else if (
      resubmissionMessage.trim().length < 10
    ) {
      errors.resubmissionMessage =
        "The contribution message must contain at least 10 characters.";
    } else if (
      resubmissionMessage.trim().length > 1000
    ) {
      errors.resubmissionMessage =
        "The contribution message cannot exceed 1000 characters.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleResubmit(event) {
    event.preventDefault();

    if (!validateResubmission()) {
      return;
    }

    clearMessages();
    setIsSubmitting(true);

    try {
      const updated = await resubmitContribution(
        contributionId,
        {
          proposedContent: revisedContent.trim(),
          message: resubmissionMessage.trim(),
        }
      );

      setContribution(updated);
      setSuccessMessage(
        "Contribution resubmitted successfully."
      );
    } catch (error) {
      const apiError = getApiError(error);

      setErrorMessage(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <LoadingScreen message="Loading contribution..." />
    );
  }

  if (errorMessage && !contribution) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-3xl font-black text-slate-950">
            Contribution unavailable
          </h1>

          <p className="mt-4 text-red-700">
            {errorMessage}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={loadContribution}
              className="rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-600"
            >
              Try again
            </button>

            <Link
              to="/my-contributions"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Back to contributions
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const article = contribution.article;
  const contributor = contribution.contributor;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-amber-700"
      >
        ← Go back
      </button>

      <div className="mt-7 flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <ContributionStatusBadge
              status={contribution.status}
            />

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Based on version{" "}
              {contribution.baseVersion}
            </span>
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950">
            {article?.title ??
              "Contribution details"}
          </h1>

          <p className="mt-3 text-slate-600">
            Submitted by{" "}
            <span className="font-semibold text-slate-900">
              {contributor?.name ?? "Unknown contributor"}
            </span>
            {" · "}
            {formatDate(contribution.createdAt)}
          </p>
        </div>

        {article?.slug && (
          <Link
            to={`/articles/${article.slug}`}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
          >
            View published article
          </Link>
        )}
      </div>

      {successMessage && (
        <div
          role="status"
          className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800"
        >
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      )}

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          Contributor explanation
        </p>

        <p className="mt-3 leading-7 text-slate-700">
          {contribution.message}
        </p>
      </section>

      {contribution.reviewComment && (
        <section className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Reviewer feedback
          </p>

          <p className="mt-3 leading-7 text-blue-950">
            {contribution.reviewComment}
          </p>

          {contribution.reviewedAt && (
            <p className="mt-4 text-xs text-blue-700">
              Reviewed{" "}
              {formatDate(contribution.reviewedAt)}
            </p>
          )}
        </section>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-200 pb-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Before
            </p>

            <h2 className="mt-2 text-xl font-black text-slate-950">
              Original article
            </h2>
          </div>

          <div className="prose prose-slate mt-6 max-w-none">
            <ReactMarkdown>
              {contribution.originalContent}
            </ReactMarkdown>
          </div>
        </section>

        <section className="min-w-0 rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
          <div className="border-b border-amber-200 pb-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
              After
            </p>

            <h2 className="mt-2 text-xl font-black text-slate-950">
              Proposed revision
            </h2>
          </div>

          <div className="prose prose-slate mt-6 max-w-none">
            <ReactMarkdown>
              {contribution.proposedContent}
            </ReactMarkdown>
          </div>
        </section>
      </div>

      {canReview && (
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-600">
              Publisher review
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Decide what happens next
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Accept and merge the contribution, ask the
              contributor to revise it, or reject it.
            </p>
          </div>

          {selectedAction === REVIEW_ACTIONS.NONE ? (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  openReviewAction(
                    REVIEW_ACTIONS.ACCEPT
                  )
                }
                disabled={isSubmitting}
                className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-60"
              >
                Accept and merge
              </button>

              <button
                type="button"
                onClick={() =>
                  openReviewAction(
                    REVIEW_ACTIONS.REQUEST_CHANGES
                  )
                }
                disabled={isSubmitting}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-60"
              >
                Request changes
              </button>

              <button
                type="button"
                onClick={() =>
                  openReviewAction(
                    REVIEW_ACTIONS.REJECT
                  )
                }
                disabled={isSubmitting}
                className="rounded-xl border border-red-300 bg-white px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleReviewSubmit}
              className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <label
                htmlFor="review-comment"
                className="block font-bold text-slate-900"
              >
                {selectedAction ===
                  REVIEW_ACTIONS.ACCEPT &&
                  "Optional acceptance comment"}

                {selectedAction ===
                  REVIEW_ACTIONS.REQUEST_CHANGES &&
                  "Explain the required changes"}

                {selectedAction ===
                  REVIEW_ACTIONS.REJECT &&
                  "Explain why this contribution is being rejected"}
              </label>

              <textarea
                id="review-comment"
                value={reviewComment}
                onChange={(event) => {
                  setReviewComment(event.target.value);

                  if (fieldErrors.reviewComment) {
                    setFieldErrors((current) => ({
                      ...current,
                      reviewComment: "",
                    }));
                  }
                }}
                disabled={isSubmitting}
                rows={5}
                maxLength={1000}
                placeholder={
                  selectedAction ===
                  REVIEW_ACTIONS.ACCEPT
                    ? "Looks good. Approved."
                    : "Give the contributor clear, actionable feedback."
                }
                className={[
                  "mt-4 w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 outline-none transition",
                  fieldErrors.reviewComment
                    ? "border-red-400 focus:ring-4 focus:ring-red-100"
                    : "border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-100",
                ].join(" ")}
              />

              <div className="mt-2 flex justify-between gap-4">
                <div>
                  {fieldErrors.reviewComment && (
                    <p className="text-sm text-red-600">
                      {fieldErrors.reviewComment}
                    </p>
                  )}
                </div>

                <p className="text-xs text-slate-500">
                  {reviewComment.length}/1000
                </p>
              </div>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cancelReviewAction}
                  disabled={isSubmitting}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={[
                    "rounded-xl px-5 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60",
                    selectedAction ===
                    REVIEW_ACTIONS.ACCEPT
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : selectedAction ===
                        REVIEW_ACTIONS.REQUEST_CHANGES
                      ? "bg-blue-600 hover:bg-blue-500"
                      : "bg-red-700 hover:bg-red-600",
                  ].join(" ")}
                >
                  {isSubmitting
                    ? "Processing..."
                    : selectedAction ===
                      REVIEW_ACTIONS.ACCEPT
                    ? "Confirm acceptance"
                    : selectedAction ===
                      REVIEW_ACTIONS.REQUEST_CHANGES
                    ? "Send change request"
                    : "Confirm rejection"}
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      {canResubmit && (
        <section className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-6 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">
            Revision requested
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Update and resubmit your contribution
          </h2>

          <p className="mt-2 text-sm leading-6 text-blue-900">
            Address the publisher’s feedback, update your
            proposed content, and send it for review again.
          </p>

          <form
            onSubmit={handleResubmit}
            className="mt-7 space-y-6"
          >
            <div>
              <label
                htmlFor="revised-content"
                className="block font-bold text-slate-900"
              >
                Revised article content
              </label>

              <textarea
                id="revised-content"
                value={revisedContent}
                onChange={(event) => {
                  setRevisedContent(event.target.value);

                  if (fieldErrors.revisedContent) {
                    setFieldErrors((current) => ({
                      ...current,
                      revisedContent: "",
                    }));
                  }
                }}
                disabled={isSubmitting}
                rows={20}
                className={[
                  "mt-3 w-full rounded-2xl border bg-slate-950 px-5 py-4 font-mono text-sm leading-7 text-slate-100 outline-none transition",
                  fieldErrors.revisedContent
                    ? "border-red-400 focus:ring-4 focus:ring-red-100"
                    : "border-slate-700 focus:border-amber-400 focus:ring-4 focus:ring-amber-100",
                ].join(" ")}
              />

              {fieldErrors.revisedContent && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldErrors.revisedContent}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="resubmission-message"
                className="block font-bold text-slate-900"
              >
                Updated contribution message
              </label>

              <textarea
                id="resubmission-message"
                value={resubmissionMessage}
                onChange={(event) => {
                  setResubmissionMessage(
                    event.target.value
                  );

                  if (
                    fieldErrors.resubmissionMessage
                  ) {
                    setFieldErrors((current) => ({
                      ...current,
                      resubmissionMessage: "",
                    }));
                  }
                }}
                disabled={isSubmitting}
                rows={5}
                maxLength={1000}
                className={[
                  "mt-3 w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 outline-none transition",
                  fieldErrors.resubmissionMessage
                    ? "border-red-400 focus:ring-4 focus:ring-red-100"
                    : "border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
                ].join(" ")}
              />

              {fieldErrors.resubmissionMessage && (
                <p className="mt-2 text-sm text-red-600">
                  {
                    fieldErrors.resubmissionMessage
                  }
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Resubmitting..."
                : "Resubmit contribution"}
            </button>
          </form>
        </section>
      )}

      {canWithdraw && (
        <section className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 sm:p-8">
          <h2 className="text-xl font-black text-slate-950">
            Withdraw contribution
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-red-800">
            Withdraw this proposal if you no longer want
            the publisher to review it. This action cannot
            be reversed in the current MVP.
          </p>

          <button
            type="button"
            onClick={handleWithdraw}
            disabled={isSubmitting}
            className="mt-5 rounded-xl border border-red-300 bg-white px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Withdraw contribution
          </button>
        </section>
      )}
    </section>
  );
}