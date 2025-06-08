const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');

// List all hotels
router.get('/', hotelController.listAllHotels);

// Filter hotels with multiple criteria
router.get('/filter', hotelController.filterHotels);

// Search hotels (basic search with city/province)
router.get('/search', hotelController.searchHotels);

// Get hotel details
router.get('/:id', hotelController.getHotelDetails);

// Get availability for a hotel (requires check_in param)
router.get('/:id/availability', hotelController.getAvailability);

// Get pricing for a hotel (requires check_in param)
router.get('/:id/pricing', hotelController.getPricing);

// Decrease room availability (booking)
router.post('/:id/availability/decrease', hotelController.decreaseAvailability);

// Increase room availability (cancellation)
router.post('/:id/availability/increase', hotelController.increaseAvailability);

module.exports = router;
