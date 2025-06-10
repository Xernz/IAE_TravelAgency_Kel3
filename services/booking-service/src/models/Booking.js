const db = require('../config/db');
const { paginateQuery, paginatedResponse } = require('../utils/pagination');

const Booking = {
  // Updated to select all relevant fields for GQL alignment
  getById: (id, callback) => {
    db.query('SELECT id, user_id, booking_code, total_amount, currency, payment_status, special_requests, status, created_at, updated_at FROM Bookings WHERE id = ?', [id], (err, results) => callback(err, results[0]));
  },
  // Updated to select all relevant fields for GQL alignment
  getUserBookings: (userId, callback) => {
    db.query('SELECT id, user_id, booking_code, total_amount, currency, payment_status, special_requests, status, created_at, updated_at FROM Bookings WHERE user_id = ?', [userId], (err, results) => callback(err, results));
  },
  // Expanded to support all fields; expects an object with all fields
  create: (bookingData, callback) => {
    // bookingData should be: { user_id, booking_code, total_amount, currency, payment_status, special_requests, status }
    // updated_at is handled by DB trigger or set to NOW() if needed
    const {
      user_id,
      booking_code = null,
      total_amount = null,
      currency = null,
      payment_status = null,
      special_requests = null,
      status = 'active'
    } = bookingData;
    db.query(
      `INSERT INTO Bookings (user_id, booking_code, total_amount, currency, payment_status, special_requests, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [user_id, booking_code, total_amount, currency, payment_status, special_requests, status],
      (err, results) => callback(err, results)
    );
  },
  
  listAll: (params, callback) => {
    // Base query for getting all bookings
    const baseSql = `SELECT * FROM Bookings ORDER BY created_at DESC`;
    
    // Count total items for pagination metadata
    const countSql = `SELECT COUNT(*) as total FROM Bookings`;
    
    // Apply pagination
    const { sql, values, pagination } = paginateQuery(baseSql, params);
    
    // Execute count query first
    db.query(countSql, [], (countErr, countResults) => {
      if (countErr) return callback(countErr, null);
      
      const totalItems = countResults[0].total;
      
      // Then execute the paginated query
      db.query(sql, values, (err, results) => {
        if (err) return callback(err, null);
        
        // Format the response with pagination metadata
        const response = paginatedResponse(results, pagination, totalItems);
        callback(null, response);
      });
    });
  },
  
  filter: (params, callback) => {
    const { 
      user_id, booking_code, status, payment_status, item_type,
      min_total, max_total, start_date, end_date, sort_by, sort_order,
      origin_city, destination_city, origin_province, destination_province,
      service_class, provider, travel_date_start, travel_date_end,
      page, limit 
    } = params;
    
    let baseSql = `
      SELECT b.*, bi.type as item_type, bi.origin_city, bi.destination_city, 
      bi.origin_province, bi.destination_province, bi.service_class, bi.provider, bi.travel_date
      FROM Bookings b
      LEFT JOIN BookingItems bi ON b.id = bi.booking_id
      WHERE 1=1
    `;
    
    const baseValues = [];
    
    // Original filters
    if (user_id) { baseSql += ' AND b.user_id = ?'; baseValues.push(user_id); }
    if (booking_code) { baseSql += ' AND b.booking_code LIKE ?'; baseValues.push(`%${booking_code}%`); }
    if (status) { baseSql += ' AND b.status = ?'; baseValues.push(status); }
    if (payment_status) { baseSql += ' AND b.payment_status = ?'; baseValues.push(payment_status); }
    if (item_type) { baseSql += ' AND bi.type = ?'; baseValues.push(item_type); }
    if (min_total) { baseSql += ' AND b.total_amount >= ?'; baseValues.push(min_total); }
    if (max_total) { baseSql += ' AND b.total_amount <= ?'; baseValues.push(max_total); }
    if (start_date) { baseSql += ' AND DATE(b.created_at) >= ?'; baseValues.push(start_date); }
    if (end_date) { baseSql += ' AND DATE(b.created_at) <= ?'; baseValues.push(end_date); }
    
    // Indonesian-specific filters
    if (origin_city) { baseSql += ' AND bi.origin_city = ?'; baseValues.push(origin_city); }
    if (destination_city) { baseSql += ' AND bi.destination_city = ?'; baseValues.push(destination_city); }
    if (origin_province) { baseSql += ' AND bi.origin_province = ?'; baseValues.push(origin_province); }
    if (destination_province) { baseSql += ' AND bi.destination_province = ?'; baseValues.push(destination_province); }
    if (service_class) { baseSql += ' AND bi.service_class = ?'; baseValues.push(service_class); }
    if (provider) { baseSql += ' AND bi.provider LIKE ?'; baseValues.push(`%${provider}%`); }
    if (travel_date_start) { baseSql += ' AND bi.travel_date >= ?'; baseValues.push(travel_date_start); }
    if (travel_date_end) { baseSql += ' AND bi.travel_date <= ?'; baseValues.push(travel_date_end); }
    
    // Add sorting
    if (sort_by) {
      const validSortColumns = ['created_at', 'total_amount', 'status', 'payment_status'];
      const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
      const order = sort_order && sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      
      baseSql += ` ORDER BY b.${sortColumn} ${order}`;
    } else {
      baseSql += ' ORDER BY b.created_at DESC';
    }
    
    // Group by booking id to avoid duplicates from the join
    baseSql += ' GROUP BY b.id';
    
    // Count total items for pagination metadata
    // We need to wrap the original query to count after grouping
    const countSql = `SELECT COUNT(*) as total FROM (${baseSql}) as countQuery`;
    
    // Apply pagination
    const { sql, values, pagination } = paginateQuery(baseSql, { page, limit }, baseValues);
    
    // Execute count query first
    db.query(countSql, baseValues, (countErr, countResults) => {
      if (countErr) return callback(countErr, null);
      
      const totalItems = countResults[0].total;
      
      // Then execute the paginated query
      db.query(sql, values, (err, results) => {
        if (err) return callback(err, null);
        
        // Format the response with pagination metadata
        const response = paginatedResponse(results, pagination, totalItems);
        callback(null, response);
      });
    });
  }
};

Booking.cancel = (bookingId, callback) => {
  db.query('UPDATE Bookings SET status = ? WHERE id = ?', ['cancelled', bookingId], callback);
};

module.exports = Booking;
