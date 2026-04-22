const express = require('express');
const paypalController = require('../controllers/paypalController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post(
  '/create-order',
  authMiddleware.protect,
  paypalController.createPayPalOrder
);

router.post(
  '/capture-order',
  authMiddleware.protect,
  paypalController.capturePayPalOrder
);

module.exports = router;