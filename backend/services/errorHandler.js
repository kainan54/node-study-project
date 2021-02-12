const sendErrorDev = (error, resp) => {
    resp.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        stack: error.stack,
        fullError: error,
    });
};
const sendErrorProd = (error, resp) => {
    // only send trusted errors in prodctions
    if (error.isOperational) {
        resp.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        });
    } else {
        // logging for ourselves...
        console.error('ERROR!', err);

        // dont leak the details of programming/unknown error
        resp.status(500).json({
            status: 'error',
            // tryna put some jokes in my personal work...
            message: 'its all gone to shite run while you can...',
        });
    }
};
const errorHandler = (error, req, resp, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if (process.env.NODE_ENV === 'development') sendErrorDev(error, resp);
    else if (process.env.NODE_ENV === 'production') sendErrorProd(error, resp);
};

module.exports = errorHandler;
