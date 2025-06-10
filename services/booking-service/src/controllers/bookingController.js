const Booking = require('../models/Booking');
const BookingItem = require('../models/BookingItem');

exports.getBookingById = (req, res) => {
  const id = req.params.id;
  Booking.getById(id, (err, booking) => {
    if (!booking) return res.status(404).json({ status: 'error', message: 'Booking not found' });
    BookingItem.getByBookingId(id, (err, items) => {
      res.json({ status: 'success', data: { ...booking, items } });
    });
  });
};

exports.getUserBookings = (req, res) => {
  const userId = req.params.userId;
  Booking.getUserBookings(userId, (err, bookings) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to fetch bookings' });
    res.json({ status: 'success', data: bookings });
  });
};

exports.listAllBookings = (req, res) => {
  // Extract pagination parameters from query string
  const { page, limit } = req.query;
  
  Booking.listAll({ page, limit }, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to retrieve bookings' });
    
    // Return data and pagination metadata
    res.json({
      status: 'success',
      data: result.data,
      pagination: result.pagination
    });
  });
};

exports.filterBookings = (req, res) => {
  const { 
    user_id, booking_code, status, payment_status, item_type,
    min_total, max_total, start_date, end_date, sort_by, sort_order,
    origin_city, destination_city, origin_province, destination_province,
    service_class, provider, travel_date_start, travel_date_end,
    page, limit 
  } = req.query;
  
  // Convert string parameters to appropriate types
  const params = {
    // Original parameters
    user_id,
    booking_code,
    status,
    payment_status,
    item_type,
    min_total: min_total ? parseFloat(min_total) : undefined,
    max_total: max_total ? parseFloat(max_total) : undefined,
    start_date,
    end_date,
    sort_by,
    sort_order,
    
    // Indonesian-specific parameters
    origin_city,
    destination_city,
    origin_province,
    destination_province,
    service_class,
    provider,
    travel_date_start,
    travel_date_end,
    
    // Pagination
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 10
  };
  
  Booking.filter(params, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Filter failed', details: err.message });
    
    // Return data and pagination metadata
    res.json({
      status: 'success',
      data: result.data,
      pagination: result.pagination
    });
  });
};

exports.cancelBooking = (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ status: 'error', message: 'Missing booking id' });
  }
  Booking.cancel(id, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to cancel booking' });
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Booking not found' });
    }
    res.json({ status: 'success', message: 'Booking cancelled' });
  });
};

exports.createBooking = (req, res) => {
  // Accept all possible booking fields from the request body
  const {
    user_id,
    items,
    booking_code,
    total_amount,
    currency,
    payment_status,
    special_requests,
    status // optional, default to 'active'
  } = req.body;

  if (!user_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ status: 'error', message: 'Missing user_id or items' });
  }

  // TODO: If frontend doesn't supply some fields, set defaults or compute as needed
  Booking.create({
    user_id,
    booking_code,
    total_amount,
    currency,
    payment_status,
    special_requests,
    status
  }, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to create booking' });
    const bookingId = result.insertId;
    let pending = items.length;
    if (pending === 0) {
      // Fetch and return the full booking record
      return Booking.getById(bookingId, (err, booking) => {
        if (err || !booking) return res.status(500).json({ status: 'error', message: 'Failed to fetch booking after creation' });
        return res.json({ status: 'success', data: { ...booking, items: [] } });
      });
    }
    // Insert booking items
    items.forEach(item => {
      BookingItem.create(bookingId, item, (err, itemResult) => {
        if (--pending === 0) {
          // Fetch and return the full booking record with items
          Booking.getById(bookingId, (err, booking) => {
            if (err || !booking) return res.status(500).json({ status: 'error', message: 'Failed to fetch booking after creation' });
            BookingItem.getByBookingId(bookingId, (err, allItems) => {
              return res.json({ status: 'success', data: { ...booking, items: allItems || [] } });
            });
          });
        }
      });
    });
  });
};
