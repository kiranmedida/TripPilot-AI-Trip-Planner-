import { AppError } from '../utils/appError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (parsed.body !== undefined) req.body = parsed.body;
    if (parsed.query !== undefined) req.query = parsed.query;
    if (parsed.params !== undefined) req.params = parsed.params;
    next();
  } catch (error) {
    const details = error.errors.map((err) => err.message);
    const validationError = new AppError('Validation failed', 400);
    validationError.code = 'VALIDATION_ERROR';
    validationError.details = details;
    next(validationError);
  }
};
