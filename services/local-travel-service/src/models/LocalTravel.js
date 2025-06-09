const db = require('../config/db');
const { paginateQuery, paginatedResponse } = require('../utils/pagination');

const LocalTravel = {
  // Decrease local travel unit availability
  decreaseAvailability: (localTravelId, date, quantity, callback) => {
    db.query(
      'UPDATE LocalTravelAvailability SET available_units = available_units - ? WHERE local_travel_id = ? AND date = ? AND available_units >= ?;',
      [quantity, localTravelId, date, quantity],
      (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      }
    );
  },
  // Increase local travel unit availability
  increaseAvailability: (localTravelId, date, quantity, callback) => {
    db.query(
      'UPDATE LocalTravelAvailability SET available_units = available_units + ? WHERE local_travel_id = ? AND date = ?;',
      [quantity, localTravelId, date],
      (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      }
    );
  },
  search: (params, callback) => {
    const { origin_city, destination_city, route } = params;
    let sql = `SELECT * FROM LocalTravel WHERE 1=1`;
    const values = [];
    if (origin_city) { sql += ' AND origin_city = ?'; values.push(origin_city); }
    if (destination_city) { sql += ' AND destination_city = ?'; values.push(destination_city); }
    if (route) { sql += ' AND route LIKE ?'; values.push(`%${route}%`); }
    db.query(sql, values, (err, results) => callback(err, results));
  },
  
  listAll: (params, callback) => {
    // Base query for getting all local travel options
    const baseSql = `SELECT * FROM LocalTravel ORDER BY type, operator_name`;
    
    // Count total items for pagination metadata
    const countSql = `SELECT COUNT(*) as total FROM LocalTravel`;
    
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
      origin_city, destination_city, origin_province, destination_province,
      origin_kabupaten, destination_kabupaten, type, operator_name, provider,
      route, min_capacity, max_capacity, class_type,
      has_ac, has_wifi, min_price, max_price, sort_by, sort_order,
      date,
      page, limit
    } = params;
    
    let baseSql = `
      SELECT lt.*, ltp.price, ltp.currency, ltp.class_type 
      FROM LocalTravel lt
      LEFT JOIN LocalTravelPricing ltp ON lt.id = ltp.local_travel_id
      WHERE 1=1
    `;
    
    const values = [];
    
    // Indonesian-specific filters
    if (origin_city) { baseSql += ' AND lt.origin_city = ?'; values.push(origin_city); }
    if (destination_city) { baseSql += ' AND lt.destination_city = ?'; values.push(destination_city); }
    if (origin_province) { baseSql += ' AND lt.origin_province = ?'; values.push(origin_province); }
    if (destination_province) { baseSql += ' AND lt.destination_province = ?'; values.push(destination_province); }
    if (origin_kabupaten) { baseSql += ' AND lt.origin_kabupaten = ?'; values.push(origin_kabupaten); }
    if (destination_kabupaten) { baseSql += ' AND lt.destination_kabupaten = ?'; values.push(destination_kabupaten); }
    if (class_type) { baseSql += ' AND ltp.class_type = ?'; values.push(class_type); }
    
    // Original filters
    if (type) { baseSql += ' AND lt.type = ?'; values.push(type); }
    if (operator_name) { baseSql += ' AND lt.operator_name LIKE ?'; values.push(`%${operator_name}%`); }
    if (provider) { baseSql += ' AND lt.provider LIKE ?'; values.push(`%${provider}%`); }
    if (route) { baseSql += ' AND lt.route LIKE ?'; values.push(`%${route}%`); }
    if (min_capacity) { baseSql += ' AND lt.capacity >= ?'; values.push(min_capacity); }
    if (max_capacity) { baseSql += ' AND lt.capacity <= ?'; values.push(max_capacity); }
    if (has_ac !== undefined) { baseSql += has_ac ? " AND lt.features LIKE '%AC%'" : " AND (lt.features NOT LIKE '%AC%' OR lt.features IS NULL)"; }
    if (has_wifi !== undefined) { baseSql += has_wifi ? " AND lt.features LIKE '%WiFi%'" : " AND (lt.features NOT LIKE '%WiFi%' OR lt.features IS NULL)"; }
    if (min_price) { baseSql += ' AND ltp.price >= ?'; values.push(min_price); }
    if (max_price) { baseSql += ' AND ltp.price <= ?'; values.push(max_price); }
    
    // Add sorting
    if (sort_by) {
      const validSortColumns = ['type', 'provider_name', 'capacity', 'price'];
      const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'provider_name';
      const order = sort_order && sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      
      if (sortColumn === 'price') {
        baseSql += ` ORDER BY ltp.${sortColumn} ${order}`;
      } else {
        baseSql += ` ORDER BY lt.${sortColumn} ${order}`;
      }
    } else {
      baseSql += ' ORDER BY lt.type ASC, lt.provider ASC';
    }
    
    // Count total items for pagination metadata
    // We need to use a modified version of the query for counting
    let countSql = `
      SELECT COUNT(*) as total
      FROM LocalTravel lt
      LEFT JOIN LocalTravelPricing ltp ON lt.id = ltp.local_travel_id
      WHERE 1=1
    `;
    
    // Add the same WHERE conditions to the count query
    if (origin_city) { countSql += ' AND lt.origin_city = ?'; }
    if (destination_city) { countSql += ' AND lt.destination_city = ?'; }
    if (origin_province) { countSql += ' AND lt.origin_province = ?'; }
    if (destination_province) { countSql += ' AND lt.destination_province = ?'; }
    if (type) { countSql += ' AND lt.type = ?'; }
    if (operator_name) { countSql += ' AND lt.operator_name = ?'; }
    if (provider) { countSql += ' AND lt.provider = ?'; }
    if (route) { countSql += ' AND lt.route = ?'; }
    if (min_capacity) { countSql += ' AND lt.capacity >= ?'; }
    if (max_capacity) { countSql += ' AND lt.capacity <= ?'; }
    if (class_type) { countSql += ' AND ltp.class_type = ?'; }
    if (has_ac !== undefined) { countSql += has_ac ? " AND lt.features LIKE '%AC%'" : " AND (lt.features NOT LIKE '%AC%' OR lt.features IS NULL)"; }
    if (has_wifi !== undefined) { countSql += has_wifi ? " AND lt.features LIKE '%WiFi%'" : " AND (lt.features NOT LIKE '%WiFi%' OR lt.features IS NULL)"; }
    if (min_price) { countSql += ' AND ltp.price >= ?'; }
    if (max_price) { countSql += ' AND ltp.price <= ?'; }
    if (date !== undefined) { countSql += ' AND DATE(ltp.date) = ?'; }
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
    db.query('SELECT * FROM LocalTravel WHERE id = ?', [id], (err, results) => callback(err, results[0]));
  },
  getAvailability: (localTravelId, date, callback) => {
    db.query('SELECT * FROM LocalTravelAvailability WHERE local_travel_id = ? AND date = ?', [localTravelId, date], (err, results) => callback(err, results[0]));
  },
  getPricing: (localTravelId, date, callback) => {
    db.query('SELECT * FROM LocalTravelPricing WHERE local_travel_id = ? AND date = ?', [localTravelId, date], (err, results) => callback(err, results[0]));
  }
};

module.exports = LocalTravel;
