const { response } = require('../app');
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const Tour = require(`${__dirname}/../models/tourModel`);
const APIFeatures = require(`${__dirname}/../utils/apiFeatures`);
const AppError = require(`${__dirname}/../utils/appError`);
exports.aliasTopTours = (request, response, next) => {
  request.query.limit = '5';
  request.query.sort = '-ratingsAverage,price';
  request.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTour = catchAsync(async (request, response, next) => {
  // EXECUTE QUERY
  console.log(request.query);
  const features = new APIFeatures(Tour.find(), request.query)
    .filter()
    .sort()
    .limitFields()
    .pageinate();

  const tours = await features.query;

  //SEND THE RESPONSE
  response.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (request, response, next) => {
  const tour = await Tour.findById(request.params.id);
  if (!tour) {
    next(new AppError('No tour found with the ID ', 404));
  }
  //tour.findOne({__id:request.params.id})
  response.status(200).json({
    status: 'success',
    results: tour.length,
    data: {
      tour,
    },
  });
});

exports.postTour = catchAsync(async (request, response, next) => {
  const newTour = await Tour.create(request.body);
  response.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.patchTour = catchAsync(async (reqest, response, next) => {
  const newTour = await Tour.findByIdAndUpdate(reqest.params.id, reqest.body, {
    new: true,
    runValidators: true,
  });
  if (!newTour) {
    next(new AppError('No tour found with the ID ', 404));
  }
  response.status(200).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});
exports.deleteTour = catchAsync(async (request, respnse, next) => {
  const tour = await Tour.findByIdAndDelete(request.params.id);
  if (!tour) {
    next(new AppError('No tour found with the ID ', 404));
  }
  respnse.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (request, response, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        // _id: '$ratingsAverage',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);
  response.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});
exports.getMonthlyPlan = catchAsync(async (request, response, next) => {
  const year = request.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: {
          $push: '$name',
        },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  response.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
