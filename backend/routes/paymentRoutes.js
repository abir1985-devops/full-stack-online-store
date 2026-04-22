const express = require('express');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post(
  '/stripe/create-checkout-session',
  authMiddleware.protect,
  paymentController.createStripeCheckoutSession
);

module.exports = router;