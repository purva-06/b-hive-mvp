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
          field: issue.path
            .join(".")
            .replace(/^body\./, "")
            .replace(/^params\./, "")
            .replace(/^query\./, ""),
          code: issue.code.toUpperCase(),
          message: issue.message,
        })),
      });
    }

    req.validated = {
      body: result.data.body ?? req.body,
      params: result.data.params ?? req.params,
      query: result.data.query ?? {},
    };

    req.body = req.validated.body;

    Object.assign(req.params, req.validated.params);

    next();
  };
}