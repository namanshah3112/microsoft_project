const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const User = require(`${__dirname}/../models/userModel`);
const APIFeatures = require(`${__dirname}/../utils/apiFeatures`);
const AppError = require(`${__dirname}/../utils/appError`);

const filterObj = (obj, ...allowerdFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowerdFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.getAllUsers = catchAsync(async (request, response, next) => {
  const users = await User.find();
  //SEND THE RESPONSE
  response.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.createUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'route not defined',
  });
};
exports.updateMe = catchAsync(async (request, response, next) => {
  // create error if user POST password data
  if (request.body.password || request.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates.Please use /updateMyPassword.',
        400
      )
    );
  }
  const filterdBody = filterObj(request.body, 'name', 'email');
  //update data
  const UpdateUser = await User.findByIdAndUpdate(
    request.user.id,
    filterdBody,
    {
      new: true,
      runValidators: true,
    }
  );
  response.status(200).json({
    status: 'success',
    data: {
      user: UpdateUser,
    },
  });
});
exports.deleteMe = catchAsync(async (request, response, next) => {
  await User.findByIdAndUpdate(request.user.id, { active: false });

  response.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'route not defined',
  });
};
exports.updateUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'route not defined',
  });
};
exports.deleteUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'route not defined',
  });
};
