import { useMemo, useState } from "react";

import ReactMarkdown from "react-markdown";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { createArticle } from "../../api/articleApi.js";

import {
  getApiError,
  getFieldErrors,
} from "../../utils/getApiError.js";

const initialForm = {
  title: "",
  summary: "",
  content: "",
};

export default function CreateArticlePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [editorMode, setEditorMode] =
    useState("split");

  const hasPreviewContent = useMemo(
    () => Boolean(form.content.trim()),
    [form.content]
  );

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }

    if (formError) {
      setFormError("");
    }
  }

  function validateForm() {
    const errors = {};

    const title = form.title.trim();
    const summary = form.summary.trim();
    const content = form.content.trim();

    if (!title) {
      errors.title = "Title is required.";
    } else if (title.length < 5) {
      errors.title =
        "Title must contain at least 5 characters.";
    } else if (title.length > 180) {
      errors.title =
        "Title cannot exceed 180 characters.";
    }

    if (!summary) {
      errors.summary = "Summary is required.";
    } else if (summary.length < 20) {
      errors.summary =
        "Summary must contain at least 20 characters.";
    } else if (summary.length > 500) {
      errors.summary =
        "Summary cannot exceed 500 characters.";
    }

    if (!content) {
      errors.content = "Article content is required.";
    } else if (content.length < 50) {
      errors.content =
        "Article content must contain at least 50 characters.";
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
    setFormError("");

    try {
      const article = await createArticle({
        title: form.title.trim(),
        summary: form.summary.trim(),
        content: form.content.trim(),
      });

      navigate("/my-articles", {
        replace: true,
        state: {
          createdArticleId: article.id,
        },
      });
    } catch (error) {
      const apiError = getApiError(error);

      setFormError(apiError.message);
      setFieldErrors(
        getFieldErrors(apiError.errors)
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/my-articles"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-amber-700"
      >
        ← Back to my articles
      </Link>

      <div className="mt-7">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
          New knowledge asset
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
          Create an article
        </h1>

        <p className="mt-3 max-w-3xl leading-7 text-slate-600">
          Start with a draft. You can review it before
          publishing it publicly and accepting
          contributions.
        </p>
      </div>

      {formError && (
        <div
          role="alert"
          className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
        >
          {formError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-7"
        noValidate
      >
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <label
              htmlFor="article-title"
              className="block text-sm font-bold text-slate-800"
            >
              Article title
            </label>

            <p className="mt-1 text-sm text-slate-500">
              Use a clear and descriptive title.
            </p>

            <input
              id="article-title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              disabled={isSubmitting}
              maxLength={180}
              placeholder="For example: Understanding Collaborative Knowledge"
              className={[
                "mt-3 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:bg-white",
                fieldErrors.title
                  ? "border-red-400 focus:ring-4 focus:ring-red-100"
                  : "border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-100",
              ].join(" ")}
            />

            <div className="mt-2 flex justify-between gap-4">
              <div>
                {fieldErrors.title && (
                  <p className="text-sm text-red-600">
                    {fieldErrors.title}
                  </p>
                )}
              </div>

              <p className="text-xs text-slate-500">
                {form.title.length}/180
              </p>
            </div>
          </div>

          <div className="mt-7">
            <label
              htmlFor="article-summary"
              className="block text-sm font-bold text-slate-800"
            >
              Summary
            </label>

            <p className="mt-1 text-sm text-slate-500">
              Briefly explain what the article covers.
            </p>

            <textarea
              id="article-summary"
              name="summary"
              value={form.summary}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={4}
              maxLength={500}
              placeholder="Write a concise overview for readers."
              className={[
                "mt-3 w-full resize-y rounded-2xl border bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:bg-white",
                fieldErrors.summary
                  ? "border-red-400 focus:ring-4 focus:ring-red-100"
                  : "border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-100",
              ].join(" ")}
            />

            <div className="mt-2 flex justify-between gap-4">
              <div>
                {fieldErrors.summary && (
                  <p className="text-sm text-red-600">
                    {fieldErrors.summary}
                  </p>
                )}
              </div>

              <p className="text-xs text-slate-500">
                {form.summary.length}/500
              </p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Article content
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Write using Markdown syntax.
              </p>
            </div>

            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setEditorMode("edit")}
                className={[
                  "rounded-lg px-4 py-2 text-sm font-semibold transition",
                  editorMode === "edit"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-600 hover:text-slate-950",
                ].join(" ")}
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => setEditorMode("split")}
                className={[
                  "rounded-lg px-4 py-2 text-sm font-semibold transition",
                  editorMode === "split"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-600 hover:text-slate-950",
                ].join(" ")}
              >
                Split
              </button>

              <button
                type="button"
                onClick={() => setEditorMode("preview")}
                className={[
                  "rounded-lg px-4 py-2 text-sm font-semibold transition",
                  editorMode === "preview"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-600 hover:text-slate-950",
                ].join(" ")}
              >
                Preview
              </button>
            </div>
          </div>

          <div
            className={[
              "grid",
              editorMode === "split"
                ? "lg:grid-cols-2"
                : "grid-cols-1",
            ].join(" ")}
          >
            {editorMode !== "preview" && (
              <div
                className={
                  editorMode === "split"
                    ? "border-b border-slate-200 lg:border-b-0 lg:border-r"
                    : ""
                }
              >
                <label
                  htmlFor="article-content"
                  className="sr-only"
                >
                  Article content
                </label>

                <textarea
                  id="article-content"
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  rows={24}
                  placeholder={`# Introduction

Write your article here using Markdown.

## Key idea

Explain the main concept clearly.`}
                  className={[
                    "min-h-[34rem] w-full resize-y border-0 bg-slate-950 px-5 py-5 font-mono text-sm leading-7 text-slate-100 outline-none",
                    fieldErrors.content
                      ? "ring-2 ring-inset ring-red-400"
                      : "",
                  ].join(" ")}
                />
              </div>
            )}

            {editorMode !== "edit" && (
              <div className="min-h-[34rem] bg-white px-6 py-6 sm:px-8">
                <p className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Preview
                </p>

                {hasPreviewContent ? (
                  <div className="prose prose-slate max-w-none">
                    <ReactMarkdown>
                      {form.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex min-h-[25rem] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <div>
                      <p className="font-bold text-slate-800">
                        Nothing to preview yet
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        Start writing Markdown to see the
                        rendered article.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 px-5 py-3">
            <div className="flex flex-col justify-between gap-2 sm:flex-row">
              <div>
                {fieldErrors.content && (
                  <p className="text-sm text-red-600">
                    {fieldErrors.content}
                  </p>
                )}
              </div>

              <p className="text-xs text-slate-500">
                {form.content.length} characters
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-bold text-slate-950">
            This article will be created as a draft
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            Draft articles are private. After reviewing
            your content, publish it from the My Articles
            page to make it visible and allow
            contributions.
          </p>
        </section>

        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <Link
            to="/my-articles"
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-amber-400 px-6 py-3 text-sm font-black text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Creating draft..."
              : "Create draft"}
          </button>
        </div>
      </form>
    </section>
  );
}