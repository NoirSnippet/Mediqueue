// global error handler middleware
function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.url} ->`, err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error. Please try again later.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

// 404 fallback for undefined routes
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `API route '${req.originalUrl}' with method ${req.method} not found on this server.`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
