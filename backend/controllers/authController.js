const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

exports.signup = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  const newUser = await User.create({ name, email, password });

  const token = signToken(newUser._id);

  newUser.password = undefined;

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const isCorrect = await user.correctPassword(password, user.password);

  if (!isCorrect) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = signToken(user._id);

  user.password = undefined;

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    token,
    data: {
      user,
    },
  });
});