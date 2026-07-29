import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code || 'ERROR',
        stack: err.stack,
        details: err.details || null,
      },
    });
  }

  // Production settings: Operational Errors are safe to output
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code || 'ERROR',
        details: err.details || null,
      },
    });
  }

  // Duplicate Key Error (MongoDB 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: {
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`,
        code: 'DUPLICATE_KEY_ERROR',
      },
    });
  }

  // DB validation failures
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((el) => el.message);
    return res.status(400).json({
      success: false,
      error: {
        message: 'Database validation failed.',
        code: 'DATABASE_VALIDATION_ERROR',
        details,
      },
    });
  }

  // JSON Web Token Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid authorization token.',
        code: 'INVALID_TOKEN',
      },
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Authorization token has expired.',
        code: 'TOKEN_EXPIRED',
      },
    });
  }

  // Standard programming error
  console.error('💥 ERROR:', err);
  return res.status(500).json({
    success: false,
    error: {
      message: 'Something went wrong on our end.',
      code: 'INTERNAL_SERVER_ERROR',
    },
  });
};
