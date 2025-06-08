const db = require('../config/db');
const { paginateQuery, paginatedResponse } = require('../utils/pagination');

const Train = {
  // Decrease train seat availability
  decreaseAvailability: (trainId, date, quantity, callback) => {
    db.query(
      'UPDATE TrainAvailability SET available_seats = available_seats - ? WHERE train_id = ? AND date = ? AND available_seats >= ?;',
      [quantity, trainId, date, quantity],
      (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      }
    );
  },
  // Increase train seat availability
  increaseAvailability: (trainId, date, quantity, callback) => {
    db.query(
      'UPDATE TrainAvailability SET available_seats = available_seats + ? WHERE train_id = ? AND date = ?;',
      [quantity, trainId, date],
      (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      }
    );
  },
  search: (params, callback) => {
    const { origin_station_code, destination_station_code, origin_city, destination_city, origin_province, destination_province } = params;
    let sql = `SELECT * FROM Trains WHERE 1=1`;
    const values = [];
    if (origin_station_code) { sql += ' AND origin_station_code = ?'; values.push(origin_station_code); }
    if (destination_station_code) { sql += ' AND destination_station_code = ?'; values.push(destination_station_code); }
    if (origin_city) { sql += ' AND origin_city = ?'; values.push(origin_city); }
    if (destination_city) { sql += ' AND destination_city = ?'; values.push(destination_city); }
    if (origin_province) { sql += ' AND origin_province = ?'; values.push(origin_province); }
    if (destination_province) { sql += ' AND destination_province = ?'; values.push(destination_province); }
    db.query(sql, values, (err, results) => callback(err, results));
  },
  
  listAll: (params, callback) => {
    // Base query for getting all trains
    const baseSql = `SELECT * FROM Trains ORDER BY departure_time`;
    
    // Count total items for pagination metadata
    const countSql = `SELECT COUNT(*) as total FROM Trains`;
    
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
      origin_station_code, destination_station_code, origin_city, destination_city,
      origin_province, destination_province, train_class, subclass, train_type,
      operator, min_duration, max_duration, price_category,
      min_price, max_price, departure_date, sort_by, sort_order,
      page, limit
    } = params;
    
    let baseSql = `
      SELECT t.*, tp.price, tp.currency, tp.price_category 
      FROM Trains t
      LEFT JOIN TrainPricing tp ON t.id = tp.train_id
      WHERE 1=1
    `;
    
    const values = [];
    
    // Indonesian-specific filters
    if (origin_station_code) { baseSql += ' AND t.origin_station_code = ?'; values.push(origin_station_code); }
    if (destination_station_code) { baseSql += ' AND t.destination_station_code = ?'; values.push(destination_station_code); }
    if (origin_city) { baseSql += ' AND t.origin_city = ?'; values.push(origin_city); }
    if (destination_city) { baseSql += ' AND t.destination_city = ?'; values.push(destination_city); }
    if (origin_province) { baseSql += ' AND t.origin_province = ?'; values.push(origin_province); }
    if (destination_province) { baseSql += ' AND t.destination_province = ?'; values.push(destination_province); }
    if (subclass) { baseSql += ' AND t.subclass = ?'; values.push(subclass); }
    if (train_type) { baseSql += ' AND t.train_type = ?'; values.push(train_type); }
    if (price_category) { baseSql += ' AND tp.price_category = ?'; values.push(price_category); }
    if (train_class) { baseSql += ' AND t.train_class = ?'; values.push(train_class); }
    if (operator) { baseSql += ' AND t.operator = ?'; values.push(operator); }
    if (min_duration) { baseSql += ' AND t.duration >= ?'; values.push(min_duration); }
    if (max_duration) { baseSql += ' AND t.duration <= ?'; values.push(max_duration); }
    if (min_price) { baseSql += ' AND tp.price >= ?'; values.push(min_price); }
    if (max_price) { baseSql += ' AND tp.price <= ?'; values.push(max_price); }
    if (departure_date) { baseSql += ' AND DATE(t.departure_time) = ?'; values.push(departure_date); }
    
    // Add sorting
    if (sort_by && sort_order) {
      const validSortColumns = ['departure_time', 'arrival_time', 'travel_duration', 'price', 'train_class', 'train_type'];
      const validSortOrders = ['ASC', 'DESC'];
      
      if (validSortColumns.includes(sort_by) && validSortOrders.includes(sort_order.toUpperCase())) {
        const sortColumn = sort_by === 'price' ? 'tp.price' : `t.${sort_by}`;
        baseSql += ` ORDER BY ${sortColumn} ${sort_order.toUpperCase()}`;
      } else {
        // Default sorting
        baseSql += ' ORDER BY t.departure_time ASC';
      }
    } else {
      // Default sorting
      baseSql += ' ORDER BY t.departure_time ASC';
    }
    
    // Count total items for pagination metadata
    // We need to use a modified version of the query for counting
    let countSql = `
      SELECT COUNT(*) as total
      FROM Trains t
      LEFT JOIN TrainPricing tp ON t.id = tp.train_id
      WHERE 1=1
    `;
    
    // Add the same WHERE conditions to the count query
    if (origin_station) { countSql += ' AND t.origin_station = ?'; }
    if (destination_station) { countSql += ' AND t.destination_station = ?'; }
    if (origin_city) { countSql += ' AND t.origin_city = ?'; }
    if (destination_city) { countSql += ' AND t.destination_city = ?'; }
    if (train_class) { countSql += ' AND t.train_class = ?'; }
    if (operator) { countSql += ' AND t.operator = ?'; }
    if (min_duration) { countSql += ' AND t.duration >= ?'; }
    if (max_duration) { countSql += ' AND t.duration <= ?'; }
    if (min_price) { countSql += ' AND tp.price >= ?'; }
    if (max_price) { countSql += ' AND tp.price <= ?'; }
    if (departure_date) { countSql += ' AND DATE(t.departure_time) = ?'; }
    
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
    db.query('SELECT * FROM Trains WHERE id = ?', [id], (err, results) => callback(err, results[0]));
  },
  getAvailability: (trainId, date, callback) => {
    db.query('SELECT * FROM TrainAvailability WHERE train_id = ? AND date = ?', [trainId, date], (err, results) => callback(err, results[0]));
  },
  getPricing: (trainId, date, callback) => {
    db.query('SELECT * FROM TrainPricing WHERE train_id = ? AND date = ?', [trainId, date], (err, results) => callback(err, results[0]));
  }
};

module.exports = Train;
