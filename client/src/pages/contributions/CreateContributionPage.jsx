import {
  useCallback,
  useEffect,
  useState,
} from "react";

import ReactMarkdown from "react-markdown";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  fetchPublishedArticles,
} from "../../api/articleApi.js";

import {
  submitContribution,
} from "../../api/contributionApi.js";

import LoadingScreen from "../../components/common/LoadingScreen.jsx";

import {
  getApiError,
  getFieldErrors,
} from "../../utils/getApiError.js";

const DEFAULT_PAGE = 1;
const ARTICLE_LOOKUP_LIMIT = 50;

async function findPublishedArticle(articleId) {
  let page = DEFAULT_PAGE;
  let hasNextPage = true;

  while (hasNextPage) {
    const data = await fetchPublishedArticles({
      page,
      limit: ARTICLE_LOOKUP_LIMIT,
      sort: "recently_updated",
    });

    const matchedArticle = data.articles.find(
      (item) => item.id === articleId
    );

    if (matchedArticle) {
      return matchedArticle;
    }

    hasNextPage = data.pagination.hasNextPage;
    page += 1;
  }

  return null;
}

export default function CreateContributionPage() {
  const { articleId } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);

  const [proposedContent, setProposedContent] =
    useState("");

  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [fieldErrors, setFieldErrors] =
    useState({});

  const loadArticle = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const matchedArticle =
        await findPublishedArticle(articleId);

      if (!matchedArticle) {
        throw new Error(
          "The published article could not be found."
        );
      }

      if (!matchedArticle.content) {
        throw new Error(
          "The complete article content could not be loaded."
        );
      }

      setArticle(matchedArticle);
      setProposedContent(matchedArticle.content);
    } catch (error) {
      const apiError = getApiError(error);

      setErrorMessage(
        apiError.message ||
          "Unable to load the article."
      );

      setArticle(null);
    } finally {
      setIsLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    loadArticle();
  }, [loadArticle]);

  function handleContentChange(event) {
    setProposedContent(event.target.value);

    if (fieldErrors.proposedContent) {
      setFieldErrors((current) => ({
        ...current,
        proposedContent: "",
      }));
    }

    if (errorMessage) {
      setErrorMessage("");
    }
  }

  function handleMessageChange(event) {
    setMessage(event.target.value);

    if (fieldErrors.message) {
      setFieldErrors((current) => ({
        ...current,
        message: "",
      }));
    }

    if (errorMessage) {
      setErrorMessage("");
    }
  }

  function validateForm() {
    const errors = {};

    const normalizedContent =
      proposedContent.trim();

    const normalizedOriginalContent =
      article.content.trim();

    const normalizedMessage = message.trim();

    if (!normalizedContent) {
      errors.proposedContent =
        "Proposed content is required.";
    } else if (normalizedContent.length < 50) {
      errors.proposedContent =
        "Proposed content must contain at least 50 characters.";
    } else if (
      normalizedContent === normalizedOriginalContent
    ) {
      errors.proposedContent =
        "Make at least one meaningful change before submitting.";
    }

    if (!normalizedMessage) {
      errors.message =
        "Contribution message is required.";
    } else if (normalizedMessage.length < 10) {
      errors.message =
        "Contribution message must contain at least 10 characters.";
    } else if (normalizedMessage.length > 1000) {
      errors.message =
        "Contribution message cannot exceed 1000 characters.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const contribution =
        await submitContribution(articleId, {
          proposedContent:
            proposedContent.trim(),

          message: message.trim(),
        });

      navigate("/my-contributions", {
        replace: true,
        state: {
          submittedContributionId:
            contribution.id,
        },
      });
    } catch (error) {
      const apiError = getApiError(error);

      setErrorMessage(apiError.message);

      setFieldErrors(
        getFieldErrors(apiError.errors)
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <LoadingScreen message="Preparing contribution editor..." />
    );
  }

  if (errorMessage && !article) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-3xl font-black text-slate-950">
            Could not load article
          </h1>

          <p className="mt-4 text-red-700">
            {errorMessage}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={loadArticle}
              disabled={isLoading}
              className="rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading
                ? "Trying again..."
                : "Try again"}
            </button>

            <Link
              to="/articles"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Back to articles
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to={`/articles/${article.slug}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-amber-700"
      >
        ← Back to article
      </Link>

      <div className="mt-7">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
          Contribution proposal
        </p>

        <h1 className="mt-2 text-4xl font-black text-slate-950">
          Suggest an improvement
        </h1>

        <p className="mt-3 max-w-3xl leading-7 text-slate-600">
          Edit a copy of the current article. Your
          proposal will not change the published article
          until the publisher accepts it.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-8"
        noValidate
      >
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-200 pb-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Current version
              </p>

              <h2 className="mt-2 text-xl font-bold text-slate-950">
                Original article
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Version {article.currentVersion}
              </p>
            </div>

            <div className="prose prose-slate mt-6 max-w-none">
              <ReactMarkdown>
                {article.content}
              </ReactMarkdown>
            </div>
          </section>

          <section className="min-w-0 rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
            <div className="border-b border-amber-200 pb-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
                Your proposal
              </p>

              <h2 className="mt-2 text-xl font-bold text-slate-950">
                Improved version
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Edit the Markdown content below.
              </p>
            </div>

            <label
              htmlFor="proposed-content"
              className="sr-only"
            >
              Proposed article content
            </label>

            <textarea
              id="proposed-content"
              value={proposedContent}
              onChange={handleContentChange}
              disabled={isSubmitting}
              rows={24}
              aria-invalid={Boolean(
                fieldErrors.proposedContent
              )}
              aria-describedby={
                fieldErrors.proposedContent
                  ? "proposed-content-error"
                  : undefined
              }
              className={[
                "mt-6 w-full resize-y rounded-2xl border bg-slate-950 px-5 py-4 font-mono text-sm leading-7 text-slate-100 outline-none transition",
                fieldErrors.proposedContent
                  ? "border-red-400 focus:ring-4 focus:ring-red-100"
                  : "border-slate-700 focus:border-amber-400 focus:ring-4 focus:ring-amber-100",
              ].join(" ")}
            />

            {fieldErrors.proposedContent && (
              <p
                id="proposed-content-error"
                className="mt-2 text-sm text-red-600"
              >
                {fieldErrors.proposedContent}
              </p>
            )}

            <p className="mt-2 text-right text-xs text-slate-500">
              {proposedContent.length} characters
            </p>
          </section>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <label
            htmlFor="contribution-message"
            className="block text-lg font-bold text-slate-950"
          >
            Message to the publisher
          </label>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Explain what you changed and why it improves
            the article.
          </p>

          <textarea
            id="contribution-message"
            value={message}
            onChange={handleMessageChange}
            disabled={isSubmitting}
            rows={5}
            maxLength={1000}
            aria-invalid={Boolean(
              fieldErrors.message
            )}
            aria-describedby={
              fieldErrors.message
                ? "contribution-message-error"
                : undefined
            }
            placeholder="For example: I clarified the explanation, corrected two factual issues, and added a practical example."
            className={[
              "mt-4 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:bg-white",
              fieldErrors.message
                ? "border-red-400 focus:ring-4 focus:ring-red-100"
                : "border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-100",
            ].join(" ")}
          />

          <div className="mt-2 flex justify-between gap-4">
            <div>
              {fieldErrors.message && (
                <p
                  id="contribution-message-error"
                  className="text-sm text-red-600"
                >
                  {fieldErrors.message}
                </p>
              )}
            </div>

            <p className="text-xs text-slate-500">
              {message.length}/1000
            </p>
          </div>
        </section>

        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <Link
            to={`/articles/${article.slug}`}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Submitting contribution..."
              : "Submit contribution"}
          </button>
        </div>
      </form>
    </section>
  );
}