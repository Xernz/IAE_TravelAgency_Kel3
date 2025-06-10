const Flight = require('../models/Flight');

// Create a new Flight entry
exports.createFlight = (req, res) => {
  const data = req.body;
  Flight.create(data, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to create flight', details: err.message });
    // Fetch the created entry by insertId
    Flight.getById(result.insertId, (err2, created) => {
      if (err2) return res.status(500).json({ status: 'error', message: 'Created but failed to retrieve', details: err2.message });
      res.status(201).json({ status: 'success', data: created });
    });
  });
};

// Update an existing Flight entry
exports.updateFlight = (req, res) => {
  const id = req.params.id;
  const data = req.body;
  Flight.update(id, data, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to update flight', details: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ status: 'error', message: 'Flight not found or no changes made' });
    // Fetch the updated entry
    Flight.getById(id, (err2, updated) => {
      if (err2) return res.status(500).json({ status: 'error', message: 'Updated but failed to retrieve', details: err2.message });
      res.json({ status: 'success', data: updated });
    });
  });
};

// Decrease flight seat availability (booking)
exports.decreaseAvailability = (req, res) => {
  const flightId = req.params.id;
  const { date, quantity = 1 } = req.body;
  if (!date) {
    return res.status(400).json({ status: 'error', message: 'Missing date' });
  }
  Flight.decreaseAvailability(flightId, date, quantity, (err, result) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Failed to decrease availability', details: err.message });
    }
    res.json({ status: 'success', message: 'Availability decreased', affectedRows: result.affectedRows });
  });
};

// Increase flight seat availability (cancellation)
exports.increaseAvailability = (req, res) => {
  const flightId = req.params.id;
  const { date, quantity = 1 } = req.body;
  if (!date) {
    return res.status(400).json({ status: 'error', message: 'Missing date' });
  }
  Flight.increaseAvailability(flightId, date, quantity, (err, result) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Failed to increase availability', details: err.message });
    }
    res.json({ status: 'success', message: 'Availability increased', affectedRows: result.affectedRows });
  });
};

exports.searchFlights = (req, res) => {
  const { origin_city, destination_city, date } = req.query;
  Flight.search({ origin_city, destination_city, date }, (err, flights) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Search failed' });
    res.json({ status: 'success', data: flights });
  });
};

exports.listAllFlights = (req, res) => {
  const { page, limit } = req.query;
  Flight.listAll({ page, limit }, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to retrieve flights' });
    res.json({ 
      status: 'success', 
      data: result.data,
      pagination: result.pagination 
    });
  });
};

exports.filterFlights = (req, res) => {
  const { 
    origin_city, destination_city, origin_code, destination_code,
    airline_code, airline_name, flight_class, departure_date,
    min_price, max_price, sort_by, sort_order, page, limit 
  } = req.query;
  
  // Convert string parameters to appropriate types
  const params = {
    origin_city, 
    destination_city, 
    origin_code, 
    destination_code,
    airline_code, 
    airline_name, 
    flight_class, 
    departure_date,
    min_price: min_price ? parseFloat(min_price) : undefined,
    max_price: max_price ? parseFloat(max_price) : undefined,
    sort_by, 
    sort_order,
    page,
    limit
  };
  console.log('filterFlights called with params:', params);
  try {
    Flight.filter(params, (err, result) => {
      if (err) {
        console.error('Error filtering flights:', err);
        return res.status(500).json({ status: 'error', message: 'Filter failed', details: err.message });
      }
      res.json({ 
        status: 'success', 
        data: result.data,
        pagination: result.pagination 
      });
    });
  } catch (err) {
    console.error('Unexpected error in filterFlights:', err);
    return res.status(500).json({ status: 'error', message: 'Filter failed', details: err.message });
  }
};

exports.getFlightDetails = (req, res) => {
  const id = req.params.id;
  Flight.getById(id, (err, flight) => {
    if (!flight) return res.status(404).json({ status: 'error', message: 'Flight not found' });
    res.json({ status: 'success', data: flight });
  });
};

exports.getAvailability = (req, res) => {
  const id = req.params.id;
  const date = req.query.date;
  if (!date) return res.status(400).json({ status: 'error', message: 'Missing date parameter' });
  Flight.getAvailability(id, date, (err, availability) => {
    if (!availability) return res.status(404).json({ status: 'error', message: 'No availability found' });
    res.json({ status: 'success', data: availability });
  });
};

exports.getPricing = (req, res) => {
  const id = req.params.id;
  const { date, seatClass } = req.query;
  if (!date) return res.status(400).json({ status: 'error', message: 'Missing date parameter' });
  Flight.getPricing(id, date, seatClass, (err, pricing) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Pricing query failed', details: err.message });
    if (!pricing || (Array.isArray(pricing) && pricing.length === 0)) return res.status(404).json({ status: 'error', message: 'No pricing found' });
    const result = Array.isArray(pricing) ? pricing : [pricing];
    const mapped = result.map(row => ({
      price: row.price,
      currency: row.currency || 'IDR',
      date: row.travel_date || row.date || null,
      seat_class: row.seat_class || row.class_type || row.flight_class || null
    }));
    res.json({ status: 'success', data: mapped });
  });
};
