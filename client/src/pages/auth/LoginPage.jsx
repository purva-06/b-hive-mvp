import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import PasswordInput from "../../components/common/PasswordInput.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

import {
  getApiError,
  getFieldErrors,
} from "../../utils/getApiError.js";

const initialForm = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destination =
    location.state?.from || "/dashboard";

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

    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      errors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      errors.password = "Password is required.";
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
      await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      navigate(destination, {
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
        <div className="hidden bg-slate-950 p-10 text-white lg:block">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-xl font-black text-slate-950">
            B
          </div>

          <h2 className="mt-10 text-4xl font-black leading-tight">
            Continue building knowledge together.
          </h2>

          <p className="mt-5 leading-7 text-slate-300">
            Access your articles, review contribution
            requests and track your verified contribution
            history.
          </p>

          <div className="mt-10 space-y-4 text-sm text-slate-300">
            <p>✓ Publish and manage articles</p>
            <p>✓ Submit structured improvements</p>
            <p>✓ Preserve attribution and history</p>
          </div>
        </div>

        <div className="p-7 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-600">
            Welcome back
          </p>

          <h1 className="mt-3 text-3xl font-black text-slate-950">
            Login to B HIVE
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Enter the account details you used when
            registering.
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
                htmlFor="login-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <input
                id="login-email"
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
                aria-describedby={
                  fieldErrors.email
                    ? "login-email-error"
                    : undefined
                }
                className={[
                  "w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition",
                  fieldErrors.email
                    ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-100",
                ].join(" ")}
              />

              {fieldErrors.email && (
                <p
                  id="login-email-error"
                  className="mt-2 text-sm text-red-600"
                >
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <PasswordInput
              id="login-password"
              name="password"
              value={form.password}
              onChange={handleChange}
              error={fieldErrors.password}
              disabled={isSubmitting}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-xl bg-amber-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Logging in..."
                : "Login"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-600">
            New to B HIVE?{" "}
            <Link
              to="/register"
              className="font-bold text-amber-700 hover:text-amber-800"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}