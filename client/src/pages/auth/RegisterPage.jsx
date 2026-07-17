import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import PasswordInput from "../../components/common/PasswordInput.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

import {
  getApiError,
  getFieldErrors,
} from "../../utils/getApiError.js";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

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

    const name = form.name.trim();
    const email = form.email.trim();

    if (!name) {
      errors.name = "Name is required.";
    } else if (name.length < 2) {
      errors.name =
        "Name must contain at least 2 characters.";
    } else if (name.length > 80) {
      errors.name =
        "Name cannot exceed 80 characters.";
    }

    if (!email) {
      errors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      errors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      errors.password = "Password is required.";
    } else {
      if (form.password.length < 8) {
        errors.password =
          "Password must contain at least 8 characters.";
      } else if (!/[a-z]/.test(form.password)) {
        errors.password =
          "Password must contain a lowercase letter.";
      } else if (!/[A-Z]/.test(form.password)) {
        errors.password =
          "Password must contain an uppercase letter.";
      } else if (!/[0-9]/.test(form.password)) {
        errors.password =
          "Password must contain a number.";
      }
    }

    if (!form.confirmPassword) {
      errors.confirmPassword =
        "Confirm your password.";
    } else if (
      form.password !== form.confirmPassword
    ) {
      errors.confirmPassword =
        "Passwords do not match.";
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
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      navigate("/dashboard", {
        replace: true,
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
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl items-center justify-center px-4 py-12 sm:px-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-2">
        <div className="hidden bg-amber-400 p-10 text-slate-950 lg:block">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-xl font-black text-white">
            B
          </div>

          <h2 className="mt-10 text-4xl font-black leading-tight">
            Your work should show more than a résumé.
          </h2>

          <p className="mt-5 leading-7 text-slate-800">
            Create knowledge, improve work published by
            others and build a transparent contribution
            history.
          </p>

          <div className="mt-10 space-y-4 text-sm font-medium text-slate-800">
            <p>✓ One account for publishing and contributing</p>
            <p>✓ Structured reviews instead of loose comments</p>
            <p>✓ Version history with clear attribution</p>
          </div>
        </div>

        <div className="p-7 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-600">
            Join B HIVE
          </p>

          <h1 className="mt-3 text-3xl font-black text-slate-950">
            Create your account
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Every account can publish articles and
            contribute to articles owned by others.
          </p>

          {formError && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {formError}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-5"
            noValidate
          >
            <div>
              <label
                htmlFor="register-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Full name
              </label>

              <input
                id="register-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                autoComplete="name"
                disabled={isSubmitting}
                aria-invalid={Boolean(
                  fieldErrors.name
                )}
                className={[
                  "w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition",
                  fieldErrors.name
                    ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-100",
                ].join(" ")}
              />

              {fieldErrors.name && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <input
                id="register-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isSubmitting}
                aria-invalid={Boolean(
                  fieldErrors.email
                )}
                className={[
                  "w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition",
                  fieldErrors.email
                    ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-100",
                ].join(" ")}
              />

              {fieldErrors.email && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <PasswordInput
              id="register-password"
              name="password"
              value={form.password}
              onChange={handleChange}
              label="Password"
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              error={fieldErrors.password}
              disabled={isSubmitting}
            />

            <PasswordInput
              id="register-confirm-password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              label="Confirm password"
              placeholder="Enter the password again"
              autoComplete="new-password"
              error={fieldErrors.confirmPassword}
              disabled={isSubmitting}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Creating account..."
                : "Create account"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-600">
            Already registered?{" "}
            <Link
              to="/login"
              className="font-bold text-amber-700 hover:text-amber-800"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}