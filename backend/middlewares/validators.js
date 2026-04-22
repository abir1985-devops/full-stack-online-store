const { body, param, query } = require('express-validator');

exports.signupValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

exports.createProductValidation = [
  body('reference')
    .trim()
    .notEmpty()
    .withMessage('Reference is required'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a number greater than or equal to 0'),

  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be an integer greater than or equal to 0'),

  

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
];

exports.updateProductValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product id'),

  body('reference')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Reference cannot be empty'),

  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a number greater than or equal to 0'),

  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be an integer greater than or equal to 0'),

  body('image')
    .optional()
    .isString()
    .withMessage('Image must be a string'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
];

exports.productIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product id'),
];

exports.productQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),

  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('minPrice must be a number greater than or equal to 0'),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('maxPrice must be a number greater than or equal to 0'),

  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string'),

  query('sort')
    .optional()
    .isString()
    .withMessage('Sort must be a string'),
];

exports.createOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must have at least one item'),

  body('items.*.product')
    .notEmpty()
    .withMessage('Product is required')
    .isMongoId()
    .withMessage('Product must be a valid id'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer greater than or equal to 1'),

  body('shippingAddress.fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),

  body('shippingAddress.email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('shippingAddress.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),

  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),

  body('shippingAddress.postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required'),

  body('shippingAddress.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),

  body('paymentMethod')
    .optional()
    .isIn(['stripe', 'paypal', 'cash'])
    .withMessage('Payment method must be one of: stripe, paypal, cash'),
];

exports.orderIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order id'),
];

exports.updateOrderStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order id'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage(
      'Status must be one of: pending, processing, shipped, delivered, cancelled'
    ),
];

exports.userIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user id'),
];

exports.updateUserRoleValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user id'),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),
];