const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  createOrderValidation,
  orderIdValidation,
  updateOrderStatusValidation,
} = require('../middlewares/validators');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.get('/my', authMiddleware.protect, orderController.getMyOrders);

router.get(
  '/',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  orderController.getAllOrders
);

router.patch(
  '/:id/status',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  updateOrderStatusValidation,
  handleValidationErrors,
  orderController.updateOrderStatus
);

router.patch(
  '/:id/cancel',
  authMiddleware.protect,
  orderIdValidation,
  handleValidationErrors,
  orderController.cancelMyOrder
);

router.post(
  '/',
  authMiddleware.protect,
  createOrderValidation,
  handleValidationErrors,
  orderController.createOrder
);

module.exports = router;