const db = require('../config/db');

const Payment = {
  create: (userId, bookingId, amount, method, callback) => {
    db.query(
      'INSERT INTO Payments (user_id, booking_id, amount, method, status) VALUES (?, ?, ?, ?, ?)',
      [userId, bookingId, amount, method, 'pending'],
      (err, results) => callback(err, results)
    );
  },
  getById: (id, callback) => {
    db.query('SELECT * FROM Payments WHERE id = ?', [id], (err, results) => callback(err, results[0]));
  },
  getUserPayments: (userId, callback) => {
    db.query('SELECT * FROM Payments WHERE user_id = ?', [userId], (err, results) => callback(err, results));
  },
  updateStatus: (id, status, callback) => {
    db.query('UPDATE Payments SET status = ? WHERE id = ?', [status, id], (err, results) => callback(err, results));
  },
  getPaymentsByBookingId: (bookingId, callback) => {
    db.query('SELECT * FROM Payments WHERE booking_id = ?', [bookingId], (err, results) => callback(err, results));
  }
};

module.exports = Payment;
