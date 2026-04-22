const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: [true, 'Product must have a reference'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Product must have a name'],
      trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Product must have a price'],
        min: [0, 'Price cannot be negative'],
      },

    image: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'Quantity cannot be negative'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
