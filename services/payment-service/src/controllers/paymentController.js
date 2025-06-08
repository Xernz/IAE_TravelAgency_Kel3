const Payment = require('../models/Payment');

exports.initiatePayment = (req, res) => {
  const { userId, bookingId, amount, method } = req.body;
  if (!userId || !bookingId || !amount || !method) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }
  Payment.create(userId, bookingId, amount, method, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to initiate payment' });
    res.json({ status: 'success', paymentId: result.insertId, status: 'pending' });
  });
};

exports.getPaymentStatus = (req, res) => {
  const id = req.params.id;
  Payment.getById(id, (err, payment) => {
    if (!payment) return res.status(404).json({ status: 'error', message: 'Payment not found' });
    res.json({ status: 'success', paymentId: id, status: payment.status });
  });
};

exports.getUserPayments = (req, res) => {
  const userId = req.params.userId;
  Payment.getUserPayments(userId, (err, payments) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to fetch payments' });
    res.json({ status: 'success', data: payments });
  });
};
