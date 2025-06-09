const Train = require('../models/Train');

exports.searchTrains = (req, res) => {
  const { origin_station_code, destination_station_code, origin_city, destination_city, origin_province, destination_province } = req.query;
  Train.search({ origin_station_code, destination_station_code, origin_city, destination_city, origin_province, destination_province }, (err, trains) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Search failed' });
    res.json({ status: 'success', data: trains });
  });
};

exports.listAllTrains = (req, res) => {
  // Extract pagination parameters from query string
  const { page, limit } = req.query;
  
  Train.listAll({ page, limit }, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to retrieve trains' });
    
    // Return data and pagination metadata
    res.json({
      status: 'success',
      data: result.data,
      pagination: result.pagination
    });
  });
};

exports.filterTrains = (req, res) => {
  console.log('Incoming /filter query:', req.query);
  const { 
    origin_station_code, destination_station_code, origin_city, destination_city,
    origin_province, destination_province, train_class, subclass, train_type,
    operator, min_duration, max_duration, price_category,
    min_price, max_price, departure_date, sort_by, sort_order,
    page, limit
  } = req.query;
  
  // Convert string parameters to appropriate types
  const params = {
    // Indonesian-specific fields
    origin_station_code,
    destination_station_code,
    origin_city,
    destination_city,
    origin_province,
    destination_province,
    subclass,
    train_type,
    price_category,
    
    // Original fields
    train_class,
    operator,
    min_duration: min_duration ? parseInt(min_duration) : undefined,
    max_duration: max_duration ? parseInt(max_duration) : undefined,
    min_price: min_price ? parseFloat(min_price) : undefined,
    max_price: max_price ? parseFloat(max_price) : undefined,
    departure_date,
    sort_by,
    sort_order,
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 10
  };
  console.log('Converted filter params:', params);
  
  Train.filter(params, (err, result) => {
    if (err) {
      console.error('Train.filter error:', err);
      return res.status(500).json({ status: 'error', message: 'Filter failed', details: err.message });
    }

    // Return data and pagination metadata
    res.json({
      status: 'success',
      data: result.data,
      pagination: result.pagination
    });
  });
};

exports.getTrainDetails = (req, res) => {
  const id = req.params.id;
  Train.getById(id, null, (err, train) => {
    if (!train) return res.status(404).json({ status: 'error', message: 'Train not found' });
    res.json({ status: 'success', data: train });
  });
};

exports.getAvailability = (req, res) => {
  const id = req.params.id;
  const { date } = req.query;
  if (!date) return res.status(400).json({ status: 'error', message: 'Missing date parameter' });
  Train.getAvailability(id, date, (err, avail) => {
    res.json({ status: 'success', data: avail ? avail.available_seats : 0 });
  });
};

exports.getPricing = (req, res) => {
  const id = req.params.id;
  const { date } = req.query;
  if (!date) return res.status(400).json({ status: 'error', message: 'Missing date parameter' });
  Train.getPricing(id, date, (err, pricing) => {
    res.json({ status: 'success', data: pricing ? { price: pricing.price, currency: pricing.currency } : null });
  });
};

// Decrease train seat availability
exports.decreaseAvailability = (req, res) => {
  const trainId = req.params.id;
  const { date, quantity = 1 } = req.body;
  if (!date) {
    return res.status(400).json({ status: 'error', message: 'Missing date' });
  }
  Train.decreaseAvailability(trainId, date, quantity, (err, result) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Failed to decrease availability', details: err.message });
    }
    res.json({ status: 'success', message: 'Availability decreased', affectedRows: result.affectedRows });
  });
};

// Increase train seat availability
exports.increaseAvailability = (req, res) => {
  const trainId = req.params.id;
  const { date, quantity = 1 } = req.body;
  if (!date) {
    return res.status(400).json({ status: 'error', message: 'Missing date' });
  }
  Train.increaseAvailability(trainId, date, quantity, (err, result) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Failed to increase availability', details: err.message });
    }
    res.json({ status: 'success', message: 'Availability increased', affectedRows: result.affectedRows });
  });
};
