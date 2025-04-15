// Base error creator function
const createAppError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
  error.isOperational = true;
  
  Error.captureStackTrace(error, createAppError);
  return error;
};

// Specific error creator functions
const createUnauthorizedError = (message = 'Unauthorized') => {
  return createAppError(message, 401);
};

const createValidationError = (message = 'Validation Error') => {
  return createAppError(message, 400);
};

const createNotFoundError = (message = 'Resource not found') => {
  return createAppError(message, 404);
};

module.exports = {
  createAppError,
  createUnauthorizedError,
  createValidationError,
  createNotFoundError
}; 