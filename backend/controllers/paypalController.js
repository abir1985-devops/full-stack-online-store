const axios = require('axios');
const Order = require('../models/orderModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { getPayPalAccessToken } = require('../config/paypal');

exports.createPayPalOrder = catchAsync(async (req, res, next) => {
  try {
    const { orderId } = req.body;

    console.log('PAYPAL CREATE ORDER - BODY:', req.body);
    console.log('PAYPAL CREATE ORDER - USER:', req.user?._id?.toString());

    const order = await Order.findById(orderId);

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return next(new AppError('You do not have permission to pay this order', 403));
    }

    if (order.paymentStatus === 'paid') {
      return next(new AppError('This order is already paid', 400));
    }

    const formattedAmount = Number(order.totalAmount || 0).toFixed(2);

    console.log('PAYPAL CREATE ORDER - ORDER ID:', order._id.toString());
    console.log('PAYPAL CREATE ORDER - ORDER USER:', order.user.toString());
    console.log('PAYPAL CREATE ORDER - TOTAL AMOUNT:', order.totalAmount);
    console.log('PAYPAL CREATE ORDER - FORMATTED AMOUNT:', formattedAmount);
    console.log('PAYPAL BASE URL:', process.env.PAYPAL_BASE_URL);

    const accessToken = await getPayPalAccessToken();
    console.log('PAYPAL ACCESS TOKEN RECEIVED:', !!accessToken);

    const response = await axios.post(
      `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: order._id.toString(),
            amount: {
              currency_code: 'EUR',
              value: formattedAmount,
            },
          },
        ],
        application_context: {
          return_url: 'http://localhost:5173/orders',
          cancel_url: 'http://localhost:5173/checkout',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const paypalOrder = response.data;

    console.log('PAYPAL CREATE ORDER SUCCESS:', paypalOrder);

    order.paymentProvider = 'paypal';
    order.paymentMethod = 'paypal';
    order.paymentReference = paypalOrder.id;
    await order.save();

    res.status(200).json({
      status: 'success',
      data: {
        paypalOrderId: paypalOrder.id,
      },
    });
  } catch (err) {
    console.error('❌ PAYPAL CREATE ORDER ERROR:', err.response?.data || err.message);

    return res.status(err.response?.status || 500).json({
      status: 'fail',
      message: err.response?.data || err.message,
    });
  }
});

exports.capturePayPalOrder = catchAsync(async (req, res, next) => {
  try {
    const { paypalOrderId, orderId } = req.body;

    console.log('PAYPAL CAPTURE ORDER - BODY:', req.body);
    console.log('PAYPAL CAPTURE ORDER - USER:', req.user?._id?.toString());

    const order = await Order.findById(orderId);

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return next(new AppError('You do not have permission to capture this order', 403));
    }

    const accessToken = await getPayPalAccessToken();
    console.log('PAYPAL ACCESS TOKEN RECEIVED FOR CAPTURE:', !!accessToken);

    const response = await axios.post(
      `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const captureData = response.data;

    console.log('PAYPAL CAPTURE SUCCESS:', captureData);

    if (captureData.status === 'COMPLETED') {
      order.paymentStatus = 'paid';
      order.paidAt = new Date();
      order.paymentProvider = 'paypal';
      order.paymentMethod = 'paypal';
      order.paymentReference = paypalOrderId;

      if (order.status === 'pending') {
        order.status = 'processing';
      }

      await order.save();
    }

    res.status(200).json({
      status: 'success',
      data: {
        capture: captureData,
      },
    });
  } catch (err) {
    console.error('❌ PAYPAL CAPTURE ERROR:', err.response?.data || err.message);

    return res.status(err.response?.status || 500).json({
      status: 'fail',
      message: err.response?.data || err.message,
    });
  }
});