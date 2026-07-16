export function validateRequest(schema) {
  return function requestValidator(req, res, next) {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join(".").replace(/^body\./, ""),
          code: issue.code.toUpperCase(),
          message: issue.message,
        })),
      });
    }

    if (result.data.body) {
      req.body = result.data.body;
    }

    if (result.data.params) {
      req.params = result.data.params;
    }

    if (result.data.query) {
      req.query = result.data.query;
    }

    next();
  };
}