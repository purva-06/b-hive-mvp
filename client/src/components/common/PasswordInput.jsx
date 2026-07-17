import { useState } from "react";

export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  label = "Password",
  placeholder = "Enter your password",
  autoComplete = "current-password",
  error,
  disabled = false,
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={name}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${id}-error` : undefined
          }
          className={[
            "w-full rounded-xl border bg-white px-4 py-3 pr-20 text-slate-900 outline-none transition",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
              : "border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-100",
            disabled
              ? "cursor-not-allowed bg-slate-100"
              : "",
          ].join(" ")}
        />

        <button
          type="button"
          onClick={() =>
            setIsVisible((current) => !current)
          }
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100"
        >
          {isVisible ? "Hide" : "Show"}
        </button>
      </div>

      {error && (
        <p
          id={`${id}-error`}
          className="mt-2 text-sm text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}