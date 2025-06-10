const db = require('../config/db');
const { paginateQuery, paginatedResponse } = require('../../../utils/pagination');

const Flight = {
  // Create a new Flight entry
  create: (data, callback) => {
    const {
      airline, flight_number, origin_city, destination_city, departure_time, arrival_time, aircraft_model, seat_capacity, description
    } = data;
    const sql = `INSERT INTO Flights (airline, flight_number, origin_city, destination_city, departure_time, arrival_time, aircraft_model, seat_capacity, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [airline, flight_number, origin_city, destination_city, departure_time, arrival_time, aircraft_model, seat_capacity, description];
    db.query(sql, values, callback);
  },
  // Update an existing Flight entry
  update: (id, data, callback) => {
    const fields = [];
    const values = [];
    [
      'airline', 'flight_number', 'origin_city', 'destination_city', 'departure_time', 'arrival_time', 'aircraft_model', 'seat_capacity', 'description'
    ].forEach(field => {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    });
    if (fields.length === 0) return callback(null, { affectedRows: 0 });
    const sql = `UPDATE Flights SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    db.query(sql, values, callback);
  },

  // Decrease available seats for a flight and date
  decreaseAvailability: (flightId, date, quantity, callback) => {
    db.query(
      'UPDATE FlightAvailability SET available_seats = available_seats - ? WHERE flight_id = ? AND travel_date = ? AND available_seats >= ?;',
      [quantity, flightId, date, quantity],
      (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      }
    );
  },
  // Increase available seats for a flight and date
  increaseAvailability: (flightId, date, quantity, callback) => {
    db.query(
      'UPDATE FlightAvailability SET available_seats = available_seats + ? WHERE flight_id = ? AND travel_date = ?;',
      [quantity, flightId, date],
      (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      }
    );
  },

  search: (params, callback) => {
    const { origin_city, destination_city, date } = params;
    let sql = `SELECT * FROM Flights WHERE 1=1`;
    const values = [];
    if (origin_city) { sql += ' AND origin_city = ?'; values.push(origin_city); }
    if (destination_city) { sql += ' AND destination_city = ?'; values.push(destination_city); }
    if (date) { sql += ' AND DATE(departure_time) = ?'; values.push(date); }
    db.query(sql, values, (err, results) => callback(err, results));
  },
  
  listAll: (params, callback) => {
    // Count total flights for pagination info
    db.query('SELECT COUNT(*) as total FROM Flights', [], (err, countResult) => {
      if (err) return callback(err);
      
      const totalItems = countResult[0].total;
      const baseSql = `SELECT * FROM Flights ORDER BY departure_time`;
      
      // Apply pagination if page and limit parameters exist
      if (params.page || params.limit) {
        const { sql, values, pagination } = paginateQuery(baseSql, params);
        
        db.query(sql, values, (err, results) => {
          if (err) return callback(err);
          
          const paginatedData = paginatedResponse(results, pagination, totalItems);
          callback(null, paginatedData);
        });
      } else {
        // No pagination requested, return all results
        db.query(baseSql, [], (err, results) => {
          callback(err, { data: results, pagination: null });
        });
      }
    });
  },
  
  filter: (params, callback) => {
    const { 
      origin_city, destination_city,
      airline_code, airline_name, flight_class, departure_date,
      min_price, max_price, sort_by, sort_order, page, limit
    } = params;
    
    let sql;
    let values = [];
    
    if (departure_date) {
      // Join FlightAvailability for seats_available if filtering by date
      sql = `
        SELECT f.*, fp.price, fp.currency, fa.available_seats AS seats_available
        FROM Flights f
        LEFT JOIN FlightPricing fp ON f.id = fp.flight_id
        LEFT JOIN FlightAvailability fa ON f.id = fa.flight_id AND fa.travel_date = ?
        WHERE 1=1
      `;
      values.push(departure_date);
    } else {
      // Default: no join with FlightAvailability
      sql = `
        SELECT f.*, fp.price, fp.currency
        FROM Flights f
        LEFT JOIN FlightPricing fp ON f.id = fp.flight_id
        WHERE 1=1
      `;
    }
    
    // Filtering
    if (origin_city) { sql += ' AND f.origin = ?'; values.push(origin_city); }
    if (destination_city) { sql += ' AND f.destination = ?'; values.push(destination_city); }
    if (airline_code) { sql += ' AND f.airline_code = ?'; values.push(airline_code); }
    if (airline_name) { sql += ' AND f.airline_name LIKE ?'; values.push(`%${airline_name}%`); }
    if (flight_class) { sql += ' AND f.flight_class = ?'; values.push(flight_class); }
    if (departure_date) { /* already handled above for join */ }
    if (min_price) { sql += ' AND fp.price >= ?'; values.push(min_price); }
    if (max_price) { sql += ' AND fp.price <= ?'; values.push(max_price); }
    
    // Add sorting
    if (sort_by) {
      const validSortColumns = ['departure_time', 'arrival_time', 'price', 'airline_name'];
      const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'departure_time';
      const order = sort_order && sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      
      if (sortColumn === 'price') {
        sql += ` ORDER BY fp.${sortColumn} ${order}`;
      } else {
        sql += ` ORDER BY ${sortColumn} ${order}`;
      }
    } else {
      sql += ' ORDER BY f.departure_time ASC';
    }
    
    // Count total flights matching the filter for pagination info
    const countSql = sql.replace('SELECT f.*, fp.price, fp.currency', 'SELECT COUNT(*) as total');
    db.query(countSql, values, (err, countResult) => {
      if (err) return callback(err);
      
      const totalItems = countResult[0].total;
      
      // Apply pagination if page and limit parameters exist
      if (page || limit) {
        const { sql: paginatedSql, values: paginationValues, pagination } = paginateQuery(sql, { page, limit });
        
        // Combine filter values with pagination values
        const combinedValues = [...values, ...paginationValues];
        
        db.query(paginatedSql, combinedValues, (err, results) => {
          if (err) return callback(err);
          
          const paginatedData = paginatedResponse(results, pagination, totalItems);
          callback(null, paginatedData);
        });
      } else {
        // No pagination requested, return all results
        db.query(sql, values, (err, results) => {
          callback(err, { data: results, pagination: null });
        });
      }
    });
  },
  getById: (id, callback) => {
    db.query('SELECT * FROM Flights WHERE id = ?', [id], (err, results) => callback(err, results[0]));
  },
  getAvailability: (flightId, date, callback) => {
    db.query('SELECT * FROM FlightAvailability WHERE flight_id = ? AND travel_date = ?', [flightId, date], (err, results) => callback(err, results[0]));
  },
  getPricing: (flightId, date, seatClass, callback) => {
    let sql = 'SELECT * FROM FlightPricing WHERE flight_id = ? AND travel_date = ?';
    const params = [flightId, date];
    if (seatClass) {
      sql += ' AND (seat_class = ? OR class_type = ? OR flight_class = ?)';
      params.push(seatClass, seatClass, seatClass);
    }
    db.query(sql, params, (err, results) => callback(err, results));
  }
};

module.exports = Flight;
