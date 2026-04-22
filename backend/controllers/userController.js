const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// GET /api/users (admin)
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: users,
  });
});

// GET /api/users/:id (admin)
exports.getUserById = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

// GET /api/users/me
exports.getMe = catchAsync(async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
});

// PATCH /api/users/:id/role (admin)
exports.updateUserRole = catchAsync(async (req, res) => {
  const { role } = req.body;

  if (!role || !['user', 'admin'].includes(role)) {
    throw new AppError('Role must be either "user" or "admin"', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

// PATCH /api/users/me
exports.updateMe = catchAsync(async (req, res) => {
  if (req.body.password || req.body.role) {
    throw new AppError(
      'This route is not for password or role updates',
      400
    );
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
