const db = require('../config/db');
const { paginateQuery, paginatedResponse } = require('../utils/pagination');

const Hotel = {
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
      city, province, kabupaten, postal_code, property_type, min_star_rating, max_star_rating,
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
    
    const values = [];
    
    if (city) { baseSql += ' AND h.city = ?'; values.push(city); }
    if (province) { baseSql += ' AND h.province = ?'; values.push(province); }
    if (kabupaten) { baseSql += ' AND h.kabupaten = ?'; values.push(kabupaten); }
    if (postal_code) { baseSql += ' AND h.postal_code = ?'; values.push(postal_code); }
    if (property_type) { baseSql += ' AND h.property_type = ?'; values.push(property_type); }
    if (amenities) {
      // amenities: comma-separated list, match any
      const amenityList = amenities.split(',').map(a => a.trim()).filter(Boolean);
      if (amenityList.length > 0) {
        baseSql += ' AND (' + amenityList.map(() => 'h.facilities LIKE ?').join(' OR ') + ')';
        values.push(...amenityList.map(a => `%${a}%`));
      }
    }
    if (min_star_rating) { baseSql += ' AND h.star_rating >= ?'; values.push(min_star_rating); }
    if (max_star_rating) { baseSql += ' AND h.star_rating <= ?'; values.push(max_star_rating); }
    if (min_price) { baseSql += ' AND rp.price >= ?'; values.push(min_price); }
    if (max_price) { baseSql += ' AND rp.price <= ?'; values.push(max_price); }
    if (has_breakfast !== undefined) { baseSql += ' AND rt.has_breakfast = ?'; values.push(has_breakfast); }
    if (has_wifi !== undefined) { baseSql += ' AND rt.has_wifi = ?'; values.push(has_wifi); }
    if (room_size_min) { baseSql += ' AND rt.room_size >= ?'; values.push(room_size_min); }
    
    // Add sorting
    if (sort_by) {
      const validSortColumns = ['name', 'star_rating', 'price', 'room_size'];
      const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'name';
      const order = sort_order && sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      
      if (sortColumn === 'price') {
        baseSql += ` ORDER BY rp.${sortColumn} ${order}`;
      } else if (sortColumn === 'room_size') {
        baseSql += ` ORDER BY rt.${sortColumn} ${order}`;
      } else {
        baseSql += ` ORDER BY h.${sortColumn} ${order}`;
      }
    } else {
      baseSql += ' ORDER BY h.name ASC';
    }
    
    // Count total items for pagination metadata
    // We need to use a modified version of the query for counting
    let countSql = `
      SELECT COUNT(DISTINCT h.id) as total
      FROM Hotels h
      LEFT JOIN RoomTypes rt ON h.id = rt.hotel_id
      LEFT JOIN RoomPricing rp ON rt.id = rp.room_type_id
      WHERE 1=1
    `;
    
    // Add the same WHERE conditions to the count query
    if (city) { countSql += ' AND h.city = ?'; }
    if (province) { countSql += ' AND h.province = ?'; }
    if (property_type) { countSql += ' AND h.property_type = ?'; }
    if (min_star_rating) { countSql += ' AND h.star_rating >= ?'; }
    if (max_star_rating) { countSql += ' AND h.star_rating <= ?'; }
    if (min_price) { countSql += ' AND rp.price >= ?'; }
    if (max_price) { countSql += ' AND rp.price <= ?'; }
    if (has_breakfast !== undefined) { countSql += ' AND rt.has_breakfast = ?'; }
    if (has_wifi !== undefined) { countSql += ' AND rt.has_wifi = ?'; }
    if (room_size_min) { countSql += ' AND rt.room_size >= ?'; }
    
    // Apply pagination
    const { sql, values: paginationValues, pagination } = paginateQuery(baseSql, { page, limit });
    const allValues = [...values, ...paginationValues];
    
    // Execute count query first
    db.query(countSql, values, (countErr, countResults) => {
      if (countErr) return callback(countErr, null);
      
      const totalItems = countResults[0].total;
      
      // Then execute the paginated query
      db.query(sql, allValues, (err, results) => {
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
