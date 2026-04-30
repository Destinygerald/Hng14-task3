export class ExternalApiError extends Error {
  constructor(message, statusCode = 502) {
    super(message);
    this.statusCode = 502;
  }
}

export class APIError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function asyncHandler(func) {
  return function (req, res, next) {
    Promise.resolve(func(req, res, next)).catch(next);
  };
}

export function globalErrorHandler(err, req, res, next) {
  console.error(err.stack);

  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  } else if (err instanceof ExternalApiError) {
    return res.status(err.statusCode).json({
      status: "502",
      message: err.message,
    });
  } else if (err.name == "validationError") {
    return res.status(400).json({
      status: "error",
      message: "Validation Error",
    });
  } else {
    return res.status(500).json({
      status: "error",
      message: "Upstream or server failure",
    });
  }
}
