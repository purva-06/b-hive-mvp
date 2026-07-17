const DEFAULT_ERROR_MESSAGE =
  "The request could not be completed.";

const STATUS_MESSAGES = {
  400: "The submitted request is invalid.",
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested resource could not be found.",
  408: "The request timed out. Please try again.",
  409: "The request conflicts with the current state of this resource.",
  413: "The submitted data is too large.",
  422: "Some submitted information is invalid.",
  429: "Too many requests were made. Please wait and try again.",
};

function normalizeErrors(errors) {
  if (Array.isArray(errors)) {
    return errors.filter(
      (error) =>
        error &&
        typeof error === "object"
    );
  }

  if (
    errors &&
    typeof errors === "object"
  ) {
    return Object.entries(errors).map(
      ([field, message]) => ({
        field,
        message:
          typeof message === "string"
            ? message
            : "Invalid value.",
      })
    );
  }

  return [];
}

function getStatusMessage(status) {
  if (STATUS_MESSAGES[status]) {
    return STATUS_MESSAGES[status];
  }

  if (status >= 500) {
    return "The server encountered an error. Please try again later.";
  }

  return DEFAULT_ERROR_MESSAGE;
}

export function getApiError(error) {
  if (!error) {
    return {
      message:
        "Something went wrong. Please try again.",
      errors: [],
      status: null,
    };
  }

  if (
    error.code === "ERR_CANCELED" ||
    error.name === "CanceledError"
  ) {
    return {
      message: "The request was cancelled.",
      errors: [],
      status: null,
      isCancelled: true,
    };
  }

  if (
    error.code === "ECONNABORTED" ||
    error.code === "ETIMEDOUT"
  ) {
    return {
      message:
        "The request took too long. Please try again.",
      errors: [],
      status: 408,
    };
  }

  const response = error.response;
  const responseData = response?.data;
  const status = response?.status ?? null;

  if (response) {
    const backendMessage =
      typeof responseData?.message === "string"
        ? responseData.message.trim()
        : "";

    return {
      message:
        backendMessage ||
        getStatusMessage(status),
      errors: normalizeErrors(
        responseData?.errors
      ),
      status,
    };
  }

  if (
    error.code === "ERR_NETWORK" ||
    error.request
  ) {
    return {
      message:
        "Unable to connect to the server. Confirm that the backend is running and try again.",
      errors: [],
      status: null,
      isNetworkError: true,
    };
  }

  if (
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return {
      message: error.message.trim(),
      errors: [],
      status: null,
    };
  }

  return {
    message:
      "Something went wrong. Please try again.",
    errors: [],
    status: null,
  };
}

export function getFieldErrors(
  errors = []
) {
  return normalizeErrors(errors).reduce(
    (result, error) => {
      const field =
        typeof error.field === "string"
          ? error.field.trim()
          : "";

      const message =
        typeof error.message === "string"
          ? error.message.trim()
          : "";

      if (
        field &&
        message &&
        !result[field]
      ) {
        result[field] = message;
      }

      return result;
    },
    {}
  );
}