const errorHandler = (err, req, res, _next) => {
  console.error('[ERROR]', err.message || err);
  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  res.status(status).json({ error: message });
};

module.exports = { errorHandler };
