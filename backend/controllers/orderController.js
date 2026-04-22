const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');

// POST /api/orders
exports.createOrder = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, paymentMethod, shippingAddress } = req.body;
    

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError('Order must contain at least one item', 400);
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.email ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      throw new AppError('Complete shipping address is required', 400);
    }

    const normalizedPaymentMethod = paymentMethod || 'stripe';

    let paymentProvider = 'none';
    if (normalizedPaymentMethod === 'stripe') paymentProvider = 'stripe';
    if (normalizedPaymentMethod === 'paypal') paymentProvider = 'paypal';

    const mergedItems = {};

    for (const item of items) {
      const productId = item.product.toString();
      const quantity = Number(item.quantity);

      if (!quantity || quantity < 1) {
        throw new AppError('Quantity must be at least 1', 400);
      }

      if (mergedItems[productId]) {
        mergedItems[productId] += quantity;
      } else {
        mergedItems[productId] = quantity;
      }
    }

    const productIds = Object.keys(mergedItems);

    const products = await Product.find({
      _id: { $in: productIds },
    }).session(session);

    if (products.length !== productIds.length) {
      throw new AppError('One or more products are invalid', 400);
    }

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    let totalAmount = 0;
    const orderItems = [];

    for (const productId of productIds) {
      const product = productMap.get(productId);
      const requestedQuantity = mergedItems[productId];

      if (requestedQuantity < 1) {
        throw new AppError('Quantity must be at least 1', 400);
      }

      if (product.quantity < requestedQuantity) {
        throw new AppError(`Not enough stock for: ${product.name}`, 400);
      }

      totalAmount += product.price * requestedQuantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: requestedQuantity,
        price: product.price,
        image: product.image || '',
      });

      product.quantity -= requestedQuantity;
      await product.save({ session });
    }

    const createdOrders = await Order.create(
      [
        {
          user: req.user._id,
          items: orderItems,
          shippingAddress,
          totalAmount,
          status: 'pending',
          paymentStatus: normalizedPaymentMethod === 'cod' ? 'unpaid' : 'unpaid',
          paymentMethod: normalizedPaymentMethod,
          paymentProvider,
          paymentReference: '',
          paidAt: null,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      status: 'success',
      data: { order: createdOrders[0] },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
});

// GET /api/orders/my
exports.getMyOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate(
    'items.product',
    'name price image'
  );

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: { orders },
  });
});

// PATCH /api/orders/:id/status (admin only)
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const currentStatus = order.status;

    const allowedTransitions = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    if (
      !allowedTransitions[currentStatus] ||
      !allowedTransitions[currentStatus].includes(status)
    ) {
      throw new AppError(
        `Cannot change order status from ${currentStatus} to ${status}`,
        400
      );
    }

    if (status === 'cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.product).session(session);

        if (!product) {
          throw new AppError('Product not found while restoring stock', 404);
        }

        product.quantity += item.quantity;
        await product.save({ session });
      }
    }

    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    order.status = status;
    await order.save({ session, validateBeforeSave: false });

    await session.commitTransaction();
    session.endSession();

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email role')
      .populate('items.product', 'name price image');

    res.status(200).json({
      status: 'success',
      data: { order: updatedOrder },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
});

// GET /api/orders (admin only)
exports.getAllOrders = catchAsync(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email role')
    .populate('items.product', 'name price image');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: { orders },
  });
});

// PATCH /api/orders/:id/cancel
exports.cancelMyOrder = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.user.toString() !== req.user._id.toString()) {
      throw new AppError('You do not have permission to cancel this order', 403);
    }

    if (order.status !== 'pending') {
      throw new AppError('Only pending orders can be cancelled', 400);
    }

    if (order.paymentStatus === 'paid') {
      throw new AppError('Paid orders cannot be cancelled directly', 400);
    }

    for (const item of order.items) {
      const product = await Product.findById(item.product).session(session);

      if (!product) {
        throw new AppError('Product not found while restoring stock', 404);
      }

      product.quantity += item.quantity;
      await product.save({ session });
    }

    order.status = 'cancelled';
    await order.save({ session, validateBeforeSave: false });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: 'success',
      data: { order },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
});