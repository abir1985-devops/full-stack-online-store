const express = require('express');
const authController = require('../controllers/authController');
const {
  signupValidation,
  loginValidation,
} = require('../middlewares/validators');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.post(
  '/signup',
  signupValidation,
  handleValidationErrors,
  authController.signup
);

router.post(
  '/login',
  loginValidation,
  handleValidationErrors,
  authController.login
);

module.exports = router;