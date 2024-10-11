const isHttpError = require('http-errors');

const errorHandler = (error, req, res, next) => {
  let statusCode = 500;
  let errMessage = 'An unknown error occurred.';
  if (isHttpError(error)) {
    statusCode = error.status;
    errMessage = error.message;
  }
  res.status(statusCode).json({
    error: errMessage,
  });
};

const validationError = (error) => {
  let validationErrorMessages = {};
  if (error.errors) {
    for (const field in error.errors) {
      validationErrorMessages[field] = error.errors[field].message
    }
  }
  return validationErrorMessages;
};

const emailConflictError = (error) => {
  let emailDuplicationErrorMessage = {};
  emailDuplicationErrorMessage['error'] = 'Email already in use. Please use different one.'
  return emailDuplicationErrorMessage;
};

module.exports = {
  errorHandler,
  validationError,
  emailConflictError
};