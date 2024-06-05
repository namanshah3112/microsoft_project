const express = require('express');
const tourController = require(`${__dirname}/../controllers/tourController`);
// const authController = require(`${__dirname}/../controllers/authController`);
const authController = require('../controllers/authController');

const router = express.Router();
router
  .route('/top5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTour);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
// router.param('id', tourController.checkID);
router
  .route('/')
  .get(authController.protect, tourController.getAllTour)
  .post(tourController.postTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.patchTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
