/** Class for operational errors/exceptions
 */
class AppError extends Error {
    /**
     * @param {string} message - error message
     * @param {Number} statusCode - status code used for creation of this.status also
     */
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`[0] === 4 ? 'fail' : 'error';
        this.isOperational === true;
        // idk what exactly this is doing but it gives us access to error stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
