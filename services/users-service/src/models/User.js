const db = require('../config/db');
const { paginateQuery, paginatedResponse } = require('../utils/pagination');

const User = {
  getById: (id, callback) => {
    db.query('SELECT * FROM Users WHERE id = ?', [id], (err, results) => {
      callback(err, results[0]);
    });
  },
  getByEmail: (email, callback) => {
    db.query('SELECT * FROM Users WHERE email = ?', [email], (err, results) => {
      callback(err, results[0]);
    });
  },
  
  listAll: (params, callback) => {
    // Exclude password for security
    const baseSql = `SELECT id, email, full_name, phone_number, birth_date, no_nik, address, kelurahan, kecamatan, kabupaten_kota, province, postal_code, created_at FROM Users ORDER BY full_name`;
    
    // Count total items for pagination metadata
    const countSql = `SELECT COUNT(*) as total FROM Users`;
    
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
      email, full_name, phone_number, min_age, max_age, start_date, end_date, 
      kabupaten_kota, province, postal_code, sort_by, sort_order, page, limit
    } = params;
    
    // Exclude password for security
    let baseSql = `
      SELECT id, email, full_name, phone_number, birth_date, no_nik, address, kelurahan, kecamatan, kabupaten_kota, province, postal_code, created_at 
      FROM Users
      WHERE 1=1
    `;
    
    const baseValues = [];
    
    if (email) { baseSql += ' AND email LIKE ?'; baseValues.push(`%${email}%`); }
    if (full_name) { baseSql += ' AND full_name LIKE ?'; baseValues.push(`%${full_name}%`); }
    if (phone_number) { baseSql += ' AND phone_number LIKE ?'; baseValues.push(`%${phone_number}%`); }
    
    // Indonesian-specific filters
    if (kabupaten_kota) { baseSql += ' AND kabupaten_kota LIKE ?'; baseValues.push(`%${kabupaten_kota}%`); }
    if (province) { baseSql += ' AND province LIKE ?'; baseValues.push(`%${province}%`); }
    if (postal_code) { baseSql += ' AND postal_code LIKE ?'; baseValues.push(`%${postal_code}%`); }
    
    // Age filtering using birth_date
    if (min_age) { 
      baseSql += ' AND birth_date <= DATE_SUB(CURDATE(), INTERVAL ? YEAR)';
      baseValues.push(min_age);
    }
    if (max_age) { 
      baseSql += ' AND birth_date >= DATE_SUB(CURDATE(), INTERVAL ? YEAR)';
      baseValues.push(max_age);
    }
    
    if (start_date) { baseSql += ' AND DATE(created_at) >= ?'; baseValues.push(start_date); }
    if (end_date) { baseSql += ' AND DATE(created_at) <= ?'; baseValues.push(end_date); }
    
    // Add sorting
    if (sort_by) {
      const validSortColumns = ['full_name', 'email', 'created_at', 'birth_date', 'province', 'kabupaten_kota'];
      const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'full_name';
      const order = sort_order && sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      
      baseSql += ` ORDER BY ${sortColumn} ${order}`;
    } else {
      baseSql += ' ORDER BY full_name ASC';
    }
    
    // Count total items for pagination metadata
    const countSql = `SELECT COUNT(*) as total FROM Users WHERE 1=1`;
    let countValues = [];
    
    // Add the same WHERE conditions to count query
    baseValues.forEach((value, index) => {
      // Extract the condition part from baseSql for each parameter
      const conditionMatch = baseSql.match(new RegExp(`AND\s+([^\s]+)\s+(?:LIKE|=|<=|>=|<|>)\s+\?`, 'g'));
      if (conditionMatch && conditionMatch[index]) {
        countSql += ` ${conditionMatch[index]}`;
        countValues.push(value);
      }
    });
    
    // Apply pagination
    const { sql, values, pagination } = paginateQuery(baseSql, { page, limit }, baseValues);
    
    // Execute count query first
    db.query(countSql, countValues, (countErr, countResults) => {
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
  create: (user, callback) => {
    const { 
      email, password, full_name, phone_number, birth_date, no_nik,
      address, kelurahan, kecamatan, kabupaten_kota, province, postal_code 
    } = user;
    
    db.query(
      'INSERT INTO Users (email, password, full_name, phone_number, birth_date, no_nik, address, kelurahan, kecamatan, kabupaten_kota, province, postal_code, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [email, password, full_name, phone_number, birth_date, no_nik, address, kelurahan, kecamatan, kabupaten_kota, province, postal_code],
      (err, results) => {
        callback(err, results);
      }
    );
  },
  update: (id, user, callback) => {
    const { 
      full_name, phone_number, birth_date, no_nik,
      address, kelurahan, kecamatan, kabupaten_kota, province, postal_code 
    } = user;
    
    db.query(
      'UPDATE Users SET full_name=?, phone_number=?, birth_date=?, no_nik=?, address=?, kelurahan=?, kecamatan=?, kabupaten_kota=?, province=?, postal_code=? WHERE id=?',
      [full_name, phone_number, birth_date, no_nik, address, kelurahan, kecamatan, kabupaten_kota, province, postal_code, id],
      (err, results) => {
        callback(err, results);
      }
    );
  },
  delete: (id, callback) => {
    db.query('DELETE FROM Users WHERE id=?', [id], (err, results) => {
      callback(err, results);
    });
  }
};

module.exports = User;
