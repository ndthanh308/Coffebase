/**
 * Error Handler Middleware
 * Centralized error handling and logging
 */

export const errorHandler = (err, req, res, next) => {
  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Determine status code
  let statusCode = 500;
  let message = 'Internal server error';

  if (err.message.includes('not found')) {
    statusCode = 404;
    message = err.message;
  } else if (err.message.includes('Access denied') || err.message.includes('privileges')) {
    statusCode = 403;
    message = err.message;
  } else if (err.message.includes('required') || err.message.includes('invalid')) {
    statusCode = 400;
    message = err.message;
  } else if (err.message.includes('Authentication') || err.message.includes('token')) {
    statusCode = 401;
    message = err.message;
  } else if (err.message.includes('Database error')) {
    statusCode = 500;
    message = 'Database error occurred';
  } else {
    message = err.message || message;
  }

  // Send error response
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

