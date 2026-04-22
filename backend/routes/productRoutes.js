const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const {
  createProductValidation,
  updateProductValidation,
  productIdValidation,
  productQueryValidation,
} = require('../middlewares/validators');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');

const router = express.Router();

router
  .route('/')
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    upload.single('image'),
    createProductValidation,
    handleValidationErrors,
    productController.createProduct
  )
  .get(
    productQueryValidation,
    handleValidationErrors,
    productController.getAllProducts
  );

router
  .route('/:id')
  .get(
    productIdValidation,
    handleValidationErrors,
    productController.getProductById
  )
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    upload.single('image'),
    updateProductValidation,
    handleValidationErrors,
    productController.updateProduct
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    productIdValidation,
    handleValidationErrors,
    productController.deleteProduct
  );

module.exports = router;