const db = require('../config/db');

const BookingItem = {
  getByBookingId: (bookingId, callback) => {
    db.query('SELECT * FROM BookingItems WHERE booking_id = ?', [bookingId], (err, results) => callback(err, results));
  },
  create: (bookingId, item, callback) => {
    const { 
      type, ref_id, travel_date, quantity, unit_price, subtotal,
      origin_city, destination_city, origin_province, destination_province,
      service_class, provider, details 
    } = item;
    
    db.query(
      `INSERT INTO BookingItems (
        booking_id, type, ref_id, travel_date, quantity, unit_price, subtotal,
        origin_city, destination_city, origin_province, destination_province,
        service_class, provider, details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingId, type, ref_id, travel_date, quantity || 1, unit_price, subtotal,
        origin_city, destination_city, origin_province, destination_province,
        service_class, provider, JSON.stringify(details)
      ],
      (err, results) => callback(err, results)
    );
  }
};

BookingItem.deleteByBookingId = (bookingId, callback) => {
  db.query('DELETE FROM BookingItems WHERE booking_id = ?', [bookingId], callback);
};

module.exports = BookingItem;
