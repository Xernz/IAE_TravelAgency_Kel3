const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');

// List all flights
router.get('/', flightController.listAllFlights);

// Filter flights with multiple criteria
router.get('/filter', flightController.filterFlights);

// Search flights (basic search with origin/destination/date)
router.get('/search', flightController.searchFlights);

// Get flight details
router.get('/:id', flightController.getFlightDetails);

// Get availability for a flight (requires date param)
router.get('/:id/availability', flightController.getAvailability);

// Get pricing for a flight (requires date param)
router.get('/:id/pricing', flightController.getPricing);

// Decrease flight seat availability (booking)
router.post('/:id/availability/decrease', flightController.decreaseAvailability);

// Increase flight seat availability (cancellation)
router.post('/:id/availability/increase', flightController.increaseAvailability);

module.exports = router;
