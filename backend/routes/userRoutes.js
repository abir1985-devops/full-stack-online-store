const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  userIdValidation,
  updateUserRoleValidation,
} = require('../middlewares/validators');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.get('/me', authMiddleware.protect, userController.getMe);
router.patch('/me', authMiddleware.protect, userController.updateMe);

router.patch(
  '/:id/role',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  updateUserRoleValidation,
  handleValidationErrors,
  userController.updateUserRole
);

router
  .route('/')
  .get(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    userController.getAllUsers
  );

router
  .route('/:id')
  .get(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    userIdValidation,
    handleValidationErrors,
    userController.getUserById
  );

module.exports = router;