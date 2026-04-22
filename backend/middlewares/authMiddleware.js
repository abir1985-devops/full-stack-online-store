const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.protect = async (req, res, next) => {
  try {
    let token;
    console.log('AUTH HEADER:', req.headers.authorization);

    // 1) Check if token exists in headers...
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in',
      });
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded = { id, iat, exp }

    // 3) Find user by ID
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user no longer exists',
      });
    }

    // 4) Attach user to request
    req.user = currentUser;

    // 5) Allow request to continue
    next();
  } catch (err) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid or expired token',
    });
  }
};
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user is available because protect runs first
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action',
      });
    }

    next();
  };
};
