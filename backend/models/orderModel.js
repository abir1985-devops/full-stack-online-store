const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user'],
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Order item must have a product'],
        },
        name: {
          type: String,
          required: [true, 'Order item must have a name'],
        },
        quantity: {
          type: Number,
          required: [true, 'Order item must have a quantity'],
          min: [1, 'Quantity must be at least 1'],
        },
        price: {
          type: Number,
          required: [true, 'Order item must have a price'],
          min: [0, 'Price cannot be negative'],
        },
        image: {
          type: String,
          default: '',
        },
      },
    ],
    

    shippingAddress: {
      fullName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    deliveredAt: {
      type: Date,
    },

    trackingNumber: {
      type: String,
      default: '',
    },

    totalAmount: {
      type: Number,
      required: [true, 'Order must have a total amount'],
      min: [0, 'Total amount cannot be negative'],
    },

    // 🔹 ORDER STATUS (shipping lifecycle)
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },

    // 🔹 PAYMENT STATUS (payment lifecycle)
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'failed', 'refunded'],
      default: 'unpaid',
    },

    // 🔹 PAYMENT METHOD (user choice)
    paymentMethod: {
      type: String,
      enum: ['stripe', 'paypal', 'cash'],
      default: 'stripe',
    },


    // 🔹 WHEN PAID
    paidAt: {
      type: Date,
    },

    // 🔹 WHICH PROVIDER
    paymentProvider: {
      type: String,
      enum: ['stripe', 'paypal', 'none'],
      default: 'none',
    },

    // 🔹 EXTERNAL ID (Stripe / PayPal)
    paymentReference: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);