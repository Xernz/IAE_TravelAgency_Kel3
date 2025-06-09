const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Get all payments
router.get('/', paymentController.getAllPayments); // This should be a POST route, but kept GET for simplicity in this example

// Initiate payment
router.post('/', paymentController.initiatePayment);
// Get payment status
router.get('/:id/status', paymentController.getPaymentStatus);
// Get user payment history
router.get('/user/:userId', paymentController.getUserPayments);

module.exports = router;