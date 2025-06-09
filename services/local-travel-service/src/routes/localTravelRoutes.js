const express = require('express');
const router = express.Router();
const localTravelController = require('../controllers/localTravelController');

// List all local travel options
router.get('/', localTravelController.listAllLocalTravel);

// Filter local travel options with multiple criteria
router.get('/filter', localTravelController.filterLocalTravel);

// Search local travel options (basic search with city/route)
router.get('/search', localTravelController.searchLocalTravel);

// Get local travel details
router.get('/:id', localTravelController.getLocalTravelDetails);

// Get availability for a local travel option (requires date param)
router.get('/:id/availability', localTravelController.getAvailability);

// Get pricing for a local travel option (requires date param)
router.get('/:id/pricing', localTravelController.getPricing);

// Decrease local travel unit availability (booking)
router.post('/:id/availability/decrease', localTravelController.decreaseAvailability);
// Increase local travel unit availability (cancellation)
router.post('/:id/availability/increase', localTravelController.increaseAvailability);

module.exports = router;
