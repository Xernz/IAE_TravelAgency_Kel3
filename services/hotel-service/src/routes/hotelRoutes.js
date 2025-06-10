const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');

// List all hotels
router.get('/', hotelController.listAllHotels);
// Create a new hotel entry (admin/dev only)
router.post('/', hotelController.createHotel);
// Update an existing hotel entry (admin/dev only)
router.put('/:id', hotelController.updateHotel);

// Filter hotels with multiple criteria
router.get('/filter', hotelController.filterHotels);

// [DEPRECATED] /search endpoint removed in favor of /filter. Use /filter for all hotel search and filtering.

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
