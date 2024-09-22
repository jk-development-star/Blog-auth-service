import isHttpError from 'http-errors';

export const errorHandler = (error, req, res, next) => {
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

