const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


// POST /api/products (admin)

exports.createProduct = catchAsync(async (req, res, next) => {
  const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;

  const productData = {
    ...req.body,
    image,
  };

  const product = await Product.create(productData);

  res.status(201).json({
    status: 'success',
    data: product,
  });
});

// GET /api/products
exports.getAllProducts = catchAsync(async (req, res) => {
  // ----- Filters -----
  const filter = {};

  // price range
  if (req.query.minPrice) filter.price = { ...filter.price, $gte: Number(req.query.minPrice) };
  if (req.query.maxPrice) filter.price = { ...filter.price, $lte: Number(req.query.maxPrice) };

  // search by name (case-insensitive)
  if (req.query.search) {
    filter.name = { $regex: req.query.search, $options: 'i' };
  }

  // ----- Sorting -----
  // Example: sort=price or sort=-price or sort=price,-createdAt
  const sort = req.query.sort ? req.query.sort.split(',').join(' ') : '-createdAt';

  // ----- Pagination -----
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Query + total count (for UI pagination)
  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    status: 'success',
    page,
    limit,
    total,
    results: products.length,
    data: { products },
  });
});

// GET /api/products/:id
exports.getProductById = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: product,
  });
});

// PATCH /api/products/:id
// PATCH /api/products/:id
exports.updateProduct = catchAsync(async (req, res) => {
  const updateData = {
    ...req.body,
  };

  if (req.file) {
    updateData.image = `/uploads/${req.file.filename}`;
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: product,
  });
});

// DELETE /api/products/:id
exports.deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
