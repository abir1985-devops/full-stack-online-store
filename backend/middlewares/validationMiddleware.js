const { validationResult } = require('express-validator');

exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    status: 'fail',
    message: 'Validation failed',
    errors: errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    })),
  });
};
