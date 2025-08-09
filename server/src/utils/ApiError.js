class ApiError extends Error {
  constructor(
    message = "something went wrong",
    statusCode = 500,
    errors = [],
    stack = ""
  ) {
    super(message);
    this.message = message;
    this.data = null;
    this.success = false;
    this.statusCode = statusCode;
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      data: err.data,
    });
  }
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    errors: [],
    data: null,
  });
};

export { ApiError, errorHandler };
