const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {createBooking, getBookings, updateBookingStatus, updateBooking} = require('../controllers/bookingController');

router.post('/create/v1', createBooking);
router.get('/get/v1', getBookings);
router.patch('/:id/status/v1', updateBookingStatus);
router.patch('/:id/v1', updateBooking);

module.exports = router;
