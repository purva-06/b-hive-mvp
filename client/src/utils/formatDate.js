const DEFAULT_LOCALE = "en-IN";

const DEFAULT_DATE_OPTIONS = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

export function formatDate(
  value,
  options = {},
  locale = DEFAULT_LOCALE
) {
  if (!value) {
    return "Not available";
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      ...DEFAULT_DATE_OPTIONS,
      ...options,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat(
      DEFAULT_LOCALE,
      DEFAULT_DATE_OPTIONS
    ).format(date);
  }
}

export function formatDateTime(
  value,
  options = {},
  locale = DEFAULT_LOCALE
) {
  return formatDate(
    value,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      ...options,
    },
    locale
  );
}

export function formatRelativeDate(
  value,
  locale = DEFAULT_LOCALE
) {
  if (!value) {
    return "Not available";
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  const now = new Date();

  const differenceInSeconds = Math.round(
    (date.getTime() - now.getTime()) / 1000
  );

  const absoluteDifference =
    Math.abs(differenceInSeconds);

  const units = [
    {
      unit: "year",
      seconds: 60 * 60 * 24 * 365,
    },
    {
      unit: "month",
      seconds: 60 * 60 * 24 * 30,
    },
    {
      unit: "week",
      seconds: 60 * 60 * 24 * 7,
    },
    {
      unit: "day",
      seconds: 60 * 60 * 24,
    },
    {
      unit: "hour",
      seconds: 60 * 60,
    },
    {
      unit: "minute",
      seconds: 60,
    },
    {
      unit: "second",
      seconds: 1,
    },
  ];

  const selectedUnit =
    units.find(
      ({ seconds }) =>
        absoluteDifference >= seconds
    ) ?? units[units.length - 1];

  const amount = Math.round(
    differenceInSeconds /
      selectedUnit.seconds
  );

  try {
    return new Intl.RelativeTimeFormat(
      locale,
      {
        numeric: "auto",
      }
    ).format(amount, selectedUnit.unit);
  } catch {
    return formatDate(date, {}, locale);
  }
}