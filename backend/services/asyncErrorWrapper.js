// wrapper fn for catching errors in async functions without having to put try catches in each one
const asyncErrorWrapper = (fn) => {
    return (req, resp, next) => fn(req, resp, next).catch((error) => next(error));
};

module.exports = asyncErrorWrapper;
