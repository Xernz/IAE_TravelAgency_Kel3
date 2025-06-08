const User = require('../models/User');

exports.listAllUsers = (req, res) => {
  // Extract pagination parameters from query string
  const { page, limit } = req.query;
  
  User.listAll({ page, limit }, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to retrieve users' });
    
    // Return data and pagination metadata
    res.json({
      status: 'success',
      data: result.data,
      pagination: result.pagination
    });
  });
};

exports.filterUsers = (req, res) => {
  const { 
    email, full_name, phone_number, min_age, max_age, start_date, end_date,
    kabupaten_kota, province, postal_code, sort_by, sort_order, page, limit 
  } = req.query;
  
  // Convert string parameters to appropriate types
  const params = {
    email,
    full_name,
    phone_number,
    min_age: min_age ? parseInt(min_age) : undefined,
    max_age: max_age ? parseInt(max_age) : undefined,
    start_date,
    end_date,
    // Indonesian-specific filters
    kabupaten_kota,
    province,
    postal_code,
    sort_by,
    sort_order,
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 10
  };
  
  User.filter(params, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Filter failed', details: err.message });
    
    // Return data and pagination metadata
    res.json({
      status: 'success',
      data: result.data,
      pagination: result.pagination
    });
  });
};

exports.register = (req, res) => {
  const { 
    email, password, full_name, phone_number, birth_date, no_nik,
    address, kelurahan, kecamatan, kabupaten_kota, province, postal_code 
  } = req.body;
  
  if (!email || !password || !full_name || !birth_date || !no_nik) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }
  // Check if email exists
  User.getByEmail(email, (err, user) => {
    if (user) {
      return res.status(400).json({ status: 'error', message: 'Email is already registered' });
    }
    User.create({
      email,
      password,
      full_name,
      phone_number: phone_number || null,
      birth_date,
      no_nik,
      // Indonesian-specific fields
      address: address || null,
      kelurahan: kelurahan || null,
      kecamatan: kecamatan || null,
      kabupaten_kota: kabupaten_kota || null,
      province: province || null,
      postal_code: postal_code || null
    }, (err, results) => {
      if (err) return res.status(500).json({ status: 'error', message: 'Registration failed' });
      return res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: {
          id: results.insertId,
          email,
          full_name,
          phone_number,
          birth_date,
          no_nik
        }
      });
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ status: 'error', message: 'Missing email or password' });
  }
  User.getByEmail(email, (err, user) => {
    if (!user || user.password !== password) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  });
};

exports.getProfile = (req, res) => {
  const id = req.params.id;
  User.getById(id, (err, user) => {
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    return res.status(200).json({
      status: 'success',
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone_number: user.phone_number,
        birth_date: user.birth_date,
        no_nik: user.no_nik,
        created_at: user.created_at
      }
    });
  });
};

exports.updateProfile = (req, res) => {
  const id = req.params.id;
  const { full_name, phone_number, birth_date, no_nik } = req.body;
  User.update(id, {
    full_name,
    phone_number,
    birth_date,
    no_nik
  }, (err, results) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Update failed' });
    // Fetch updated user
    User.getById(id, (err, user) => {
      return res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone_number: user.phone_number,
          birth_date: user.birth_date,
          no_nik: user.no_nik,
          created_at: user.created_at
        }
      });
    });
  });
};

exports.deleteUser = (req, res) => {
  const id = req.params.id;
  User.delete(id, (err, results) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Delete failed' });
    if (results.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    return res.status(200).json({ status: 'success', message: 'User deleted successfully' });
  });
};
