const User = require(`${__dirname}/../models/userModel`);
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const AppError = require(`${__dirname}/../utils/appError`);
const sendEmail = require(`${__dirname}/../email`);
const { promisify } = require('util');
const jsonwebtoken = require('jsonwebtoken');
const crypto = require('crypto');
const { request } = require('../app');
const { decode } = require('punycode');

const signToken = (id) => {
  return jsonwebtoken.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSentToken = (user, statusCode, response) => {
  const token = signToken(user._id);
  response.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (request, response, next) => {
  const newUser = await User.create({
    name: request.body.name,
    email: request.body.email,
    password: request.body.password,
    passwordConfirm: request.body.passwordConfirm,
    passwordChangedAt: request.body.passwordChangedAt,
    role: request.body.role,
  });
  //CREATE JSON WEBTOKEN
  const token = signToken(newUser._id);
  response.status(200).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});
exports.login = catchAsync(async (request, response, next) => {
  const { email, password } = request.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  // if email and passwords exists
  const user = await User.findOne({ email }).select('+password');
  //instance method correctPassword

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // console.log(user);z
  //if user and password correct
  createSentToken(user, 200, response);
});

exports.protect = catchAsync(async (request, response, next) => {
  // get Token and check if exists
  let token;
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith('Bearer')
  ) {
    token = request.headers.authorization.split(' ')[1];
  }
  // console.log(token);s

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  }
  //validate or verify token
  const decoded = await promisify(jsonwebtoken.verify)(
    token,
    process.env.JWT_SECRET
  );
  console.log(decoded);
  //check if user exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('The user belonging to token no longer exist...', 401)
    );
  }

  //if user change password after JWT issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login Again.'),
      401
    );
  }
  //GRANT ACCESS TO PROTECTED ROUTE
  request.user = freshUser;
  next();
});
//middleware function
//wraper function
exports.restrictTo = (...roles) => {
  return (request, response, next) => {
    //roles is array [admin,lead-guide]
    if (!roles.includes(request.user.role)) {
      return next(
        new AppError('You dont have permission to perform this action', 403)
      );
    }
    next();
  };
};
exports.forgetPassword = catchAsync(async (request, response, next) => {
  //get user bases on post email
  const user = await User.findOne({ email: request.body.email });
  if (!user) {
    return next(new AppError('There is no user with that Email Address', 404));
  }
  //generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //send it to user's email
  const resetURL = `${request.protocol}://${request.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  try {
    const message = `Forgot your password? submit a PATCH request with your new password and passwordConfirm to : ${resetURL} .\n If you didn't forget your password, please ignore this email!`;
    await sendEmail({
      email: request.body.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    response.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log('->>>', err);
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});
exports.resetPassword = catchAsync(async (request, response, next) => {
  // get user based on the token
  const HashedToken = crypto
    .createHash('sha256')
    .update(request.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: HashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // if token has not expired,and there is user, set the new password

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //update changedPasswordAt property for the user

  // the user in,send JWT
  const token = signToken(user._id);
  response.status(200).json({
    status: 'success',
    token,
  });
});

exports.updatePassword = catchAsync(async (request, response, next) => {
  //get user from collection
  const user = await User.findById(request.user.id).select('+password');

  //check if POST current password is correct
  if (
    !(await user.correctPassword(request.body.passwordCurrent, user.password))
  ) {
    return next(new AppError('Your current password is wrong', 401));
  }
  // upadate password
  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm;

  await user.save();
  // login user in , send JWT
  createSentToken(user, 200, response);
});
