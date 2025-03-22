const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;


// The returned function receives req, res, and next—just like any Express route handler.
// Promise.resolve(fn(req, res, next)) ensures that even if fn is asynchronous (async function), it is always treated as a Promise.
// If an error occurs, .catch(next) automatically forwards it to Express's error-handling middleware.
