const express = require('express');
const exp = require('constants');
const fs = require('fs');
const app = express();
const morgan = require('morgan');
const AppError = require('./utils/appError');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const globalErrorHandler = require('./controllers/errorContoller');
if (process.env.NODE_ENV === 'develpoment') {
  app.use(morgan('dev'));
}
app.use(morgan('dev'));

app.use(express.json());

app.use(express.static('./public/'));

app.use((request, response, next) => {
  request.requestTime = new Date().toISOString();
  // console.log(request.headers);
  next();
});

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
// );

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (request, response, next) => {
  next(new AppError(`Can't find ${request.originalUrl} ont this server!`));
});
app.use(globalErrorHandler);
module.exports = app;
