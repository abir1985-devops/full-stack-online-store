const stripe = require('../config/stripe');
const Order = require('../models/orderModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createStripeCheckoutSession = catchAsync(async (req, res, next) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.user.toString() !== req.user._id.toString()) {
    return next(new AppError('You do not have permission to pay this order', 403));
  }

  if (!order.items || order.items.length === 0) {
    return next(new AppError('Order has no items', 400));
  }

  const line_items = order.items.map((item) => ({
    price_data: {
      currency: 'EUR',
      product_data: {
        name: item.name || 'Product',
      },
      unit_amount: Math.round(Number(item.price) * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: order.shippingAddress.email,
    line_items,
    success_url: `${process.env.CLIENT_URL}/payment-success?orderId=${order._id}`,
    cancel_url: `${process.env.CLIENT_URL}/payment-cancel?orderId=${order._id}`,
    client_reference_id: order._id.toString(),
    metadata: {
      orderId: order._id.toString(),
      userId: req.user._id.toString(),
    },
  });

  order.paymentProvider = 'stripe';
  order.paymentMethod = 'stripe';
  order.paymentReference = session.id;
  await order.save();

  res.status(200).json({
    status: 'success',
    data: {
      url: session.url,
      sessionId: session.id,
    },
  });
});

exports.stripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.orderId || session.client_reference_id;

      if (orderId) {
        const order = await Order.findById(orderId);

        if (order) {
          order.paymentStatus = 'paid';
          
          order.paidAt = new Date();
          order.paymentProvider = 'stripe';
          order.paymentMethod = 'stripe';
          order.paymentReference = session.payment_intent || session.id;

          if (order.status === 'pending') {
            order.status = 'processing';
          }

          await order.save();
        }
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      const orderId = session.metadata?.orderId || session.client_reference_id;

      if (orderId) {
        const order = await Order.findById(orderId);

        if (order && order.paymentStatus !== 'paid') {
          order.paymentStatus = 'failed';
          await order.save();
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};