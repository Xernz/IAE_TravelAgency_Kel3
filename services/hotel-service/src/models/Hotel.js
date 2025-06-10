const db = require('../config/db');
const { paginateQuery, paginatedResponse } = require('../utils/pagination');

const Hotel = {
  // Create a new Hotel entry
  create: (data, callback) => {
    const {
      name, city, province, address, description, stars, phone, email
    } = data;
    const sql = `INSERT INTO Hotels (name, city, province, address, description, stars, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [name, city, province, address, description, stars, phone, email];
    db.query(sql, values, callback);
  },
  // Update an existing Hotel entry
  update: (id, data, callback) => {
    const fields = [];
    const values = [];
    [
      'name', 'city', 'province', 'address', 'description', 'stars', 'phone', 'email'
    ].forEach(field => {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    });
    if (fields.length === 0) return callback(null, { affectedRows: 0 });
    const sql = `UPDATE Hotels SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    db.query(sql, values, callback);
  },

  // Decrease available rooms for a room type and date
  decreaseAvailability: (roomTypeId, date, quantity, callback) => {
    db.query(
      'UPDATE RoomAvailability SET available_rooms = available_rooms - ? WHERE room_type_id = ? AND date = ? AND available_rooms >= ?;',
      [quantity, roomTypeId, date, quantity],
      (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      }
    );
  },
  // Increase available rooms for a room type and date
  increaseAvailability: (roomTypeId, date, quantity, callback) => {
    db.query(
      'UPDATE RoomAvailability SET available_rooms = available_rooms + ? WHERE room_type_id = ? AND date = ?;',
      [quantity, roomTypeId, date],
      (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      }
    );
  },

  search: (params, callback) => {
    const { city, province } = params;
    let sql = `SELECT * FROM Hotels WHERE 1=1`;
    const values = [];
    if (city) { sql += ' AND city = ?'; values.push(city); }
    if (province) { sql += ' AND province = ?'; values.push(province); }
    db.query(sql, values, (err, results) => callback(err, results));
  },
  
  listAll: (params, callback) => {
    // Base query for getting all hotels
    const baseSql = `SELECT * FROM Hotels ORDER BY name`;
    
    // Count total items for pagination metadata
    const countSql = `SELECT COUNT(*) as total FROM Hotels`;
    
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
      name, city, province, kabupaten, postal_code, property_type, min_star_rating, max_star_rating,
      min_price, max_price, has_breakfast, has_wifi, room_size_min, amenities,
      sort_by, sort_order, page, limit
    } = params;
    // Note: property_type in DB maps to accommodation_type in API
    let baseSql = `
      SELECT h.*, rt.type as room_type, rt.bed_type, rt.has_breakfast, rt.has_wifi, 
             rt.room_size, rp.price, rp.currency
      FROM Hotels h
      LEFT JOIN RoomTypes rt ON h.id = rt.hotel_id
      LEFT JOIN RoomPricing rp ON rt.id = rp.room_type_id
      WHERE 1=1
    `;
    
    const filters = [];
    const values = [];
    if (name) { filters.push('h.name LIKE ?'); values.push(`%${name}%`); }
    if (city) { filters.push('h.city = ?'); values.push(city); }
    if (province) { filters.push('h.province = ?'); values.push(province); }
    if (kabupaten) { filters.push('h.kabupaten = ?'); values.push(kabupaten); }
    if (postal_code) { filters.push('h.postal_code = ?'); values.push(postal_code); }
    if (property_type) { filters.push('h.property_type = ?'); values.push(property_type); }
    if (min_star_rating) { filters.push('h.star_rating >= ?'); values.push(min_star_rating); }
    if (max_star_rating) { filters.push('h.star_rating <= ?'); values.push(max_star_rating); }
    if (min_price) { filters.push('rp.price >= ?'); values.push(min_price); }
    if (max_price) { filters.push('rp.price <= ?'); values.push(max_price); }
    if (has_breakfast !== undefined) { filters.push('rt.has_breakfast = ?'); values.push(has_breakfast); }
    if (has_wifi !== undefined) { filters.push('rt.has_wifi = ?'); values.push(has_wifi); }
    if (room_size_min) { filters.push('rt.room_size >= ?'); values.push(room_size_min); }
    if (amenities) { filters.push('h.facilities LIKE ?'); values.push(`%${amenities}%`); }
    
    let whereClause = '';
    if (filters.length > 0) {
      whereClause = ' AND ' + filters.join(' AND ');
    }
    let sql = baseSql + whereClause;
    // Sorting
    const validSortColumns = ['name', 'star_rating', 'price', 'room_size'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'name';
    const order = sort_order && sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    if (sortColumn === 'price') {
      sql += ` ORDER BY rp.${sortColumn} ${order}`;
    } else if (sortColumn === 'room_size') {
      sql += ` ORDER BY rt.${sortColumn} ${order}`;
    } else {
      sql += ` ORDER BY h.${sortColumn} ${order}`;
    }
    // Pagination
    const { sql: paginatedSql, values: paginationValues, pagination } = paginateQuery(sql, { page, limit });
    const allValues = [...values, ...paginationValues];
    // Build count query with same filters
    let countSql = `
      SELECT COUNT(DISTINCT h.id) as total
      FROM Hotels h
      LEFT JOIN RoomTypes rt ON h.id = rt.hotel_id
      LEFT JOIN RoomPricing rp ON rt.id = rp.room_type_id
      WHERE 1=1${whereClause}
    `;
    // Execute count query first
    db.query(countSql, values, (countErr, countResults) => {
      if (countErr) return callback(countErr, null);
      const totalItems = countResults[0].total;
      // Then execute the paginated query
      db.query(paginatedSql, allValues, (err, results) => {
        if (err) return callback(err, null);
        // Format the response with pagination metadata
        const response = paginatedResponse(results, pagination, totalItems);
        callback(null, response);
      });
    });
  },
  getById: (id, callback) => {
    db.query('SELECT * FROM Hotels WHERE id = ?', [id], (err, results) => callback(err, results[0]));
  },
  getRoomTypes: (hotelId, callback) => {
    db.query('SELECT * FROM RoomTypes WHERE hotel_id = ?', [hotelId], (err, results) => callback(err, results));
  },
  getAvailability: (roomTypeId, date, callback) => {
    db.query('SELECT * FROM RoomAvailability WHERE room_type_id = ? AND date = ?', [roomTypeId, date], (err, results) => callback(err, results[0]));
  },
  getPricing: (roomTypeId, date, callback) => {
    db.query('SELECT * FROM RoomPricing WHERE room_type_id = ? AND date = ?', [roomTypeId, date], (err, results) => callback(err, results[0]));
  }
};

module.exports = Hotel;
