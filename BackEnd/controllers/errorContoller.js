const AppError = require(`${__dirname}/../utils/appError`);
const handleCastErrorDB = (err) => {
  const message = `invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  console.log(value);
  const message = `Duplicated field values : ${value} Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const error = Object.values(err.errors).map((el) => el.message);
  const message = `invalid imput data.${error.join('. ')}`;
  return new AppError(message, 400);
};
const handleJWTError = (err) =>
  new AppError('Invalid token,Please login again', 401);
const handleJWTExpiredError = (err) =>
  new AppError('Your tohen has expired! Please log in again', 401);
const sendErrorDev = (err, response) => {
  response.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = (err, response) => {
  //operational errors
  if (err.isOperational) {
    response.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //programming or unknown error
    console.error('Error->', err);
    response.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};
module.exports = (err, request, response, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  console.log(process.env);
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, response);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') {
      //error from mongoDB
      error = handleCastErrorDB(err);
    }
    if (error.code === 11000) {
      //error from mongoDB
      error = handleDuplicateFieldDB(error);
    }
    if (error.name === 'ValidationError') {
      //error from mongoDB
      error = handleValidationErrorDB(errirs);
    }
    if (error.name === 'jsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError')
      error = handleJWTExpiredError(error);

    sendErrorProd(error, response);
  }
};
