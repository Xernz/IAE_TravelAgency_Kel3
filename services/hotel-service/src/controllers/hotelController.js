const Hotel = require('../models/Hotel');

// Create a new Hotel entry
exports.createHotel = (req, res) => {
  const data = req.body;
  Hotel.create(data, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to create hotel', details: err.message });
    // Fetch the created entry by insertId
    Hotel.getById(result.insertId, (err2, created) => {
      if (err2) return res.status(500).json({ status: 'error', message: 'Created but failed to retrieve', details: err2.message });
      res.status(201).json({ status: 'success', data: created });
    });
  });
};

// Update an existing Hotel entry
exports.updateHotel = (req, res) => {
  const id = req.params.id;
  const data = req.body;
  Hotel.update(id, data, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to update hotel', details: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ status: 'error', message: 'Hotel not found or no changes made' });
    // Fetch the updated entry
    Hotel.getById(id, (err2, updated) => {
      if (err2) return res.status(500).json({ status: 'error', message: 'Updated but failed to retrieve', details: err2.message });
      res.json({ status: 'success', data: updated });
    });
  });
};

// Decrease room availability (booking)
exports.decreaseAvailability = (req, res) => {
  const hotelId = req.params.id;
  const { room_type_id, date, quantity = 1 } = req.body;
  if (!room_type_id || !date) {
    return res.status(400).json({ status: 'error', message: 'Missing room_type_id or date' });
  }
  Hotel.decreaseAvailability(room_type_id, date, quantity, (err, result) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Failed to decrease availability', details: err.message });
    }
    res.json({ status: 'success', message: 'Availability decreased', affectedRows: result.affectedRows });
  });
};

// Increase room availability (cancellation)
exports.increaseAvailability = (req, res) => {
  const hotelId = req.params.id;
  const { room_type_id, date, quantity = 1 } = req.body;
  if (!room_type_id || !date) {
    return res.status(400).json({ status: 'error', message: 'Missing room_type_id or date' });
  }
  Hotel.increaseAvailability(room_type_id, date, quantity, (err, result) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Failed to increase availability', details: err.message });
    }
    res.json({ status: 'success', message: 'Availability increased', affectedRows: result.affectedRows });
  });
};

// [DEPRECATED] searchHotels: /search endpoint is deprecated. Use filterHotels instead.
// exports.searchHotels = (req, res) => {
//   const { city, province } = req.query;
//   Hotel.search({ city, province }, (err, hotels) => {
//     if (err) return res.status(500).json({ status: 'error', message: 'Search failed' });
//     res.json({ status: 'success', data: hotels });
//   });
// };
// See filterHotels for all search/filter logic.

exports.listAllHotels = (req, res) => {
  // Extract pagination parameters from query string
  const { page, limit } = req.query;
  
  Hotel.listAll({ page, limit }, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to retrieve hotels' });
    
    // Return data and pagination metadata
    res.json({
      status: 'success',
      data: result.data,
      pagination: result.pagination
    });
  });
};

exports.filterHotels = (req, res) => {
  const { 
    name, city, province, property_type, min_star_rating, max_star_rating,
    min_price, max_price, has_breakfast, has_wifi, room_size_min,
    sort_by, sort_order, page, limit
  } = req.query;
  
  // Convert string parameters to appropriate types
  const params = {
    name,
    city, 
    province, 
    property_type,
    min_star_rating: min_star_rating ? parseFloat(min_star_rating) : undefined,
    max_star_rating: max_star_rating ? parseFloat(max_star_rating) : undefined,
    min_price: min_price ? parseFloat(min_price) : undefined,
    max_price: max_price ? parseFloat(max_price) : undefined,
    has_breakfast: has_breakfast !== undefined ? has_breakfast === 'true' : undefined,
    has_wifi: has_wifi !== undefined ? has_wifi === 'true' : undefined,
    room_size_min: room_size_min ? parseFloat(room_size_min) : undefined,
    sort_by,
    sort_order,
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 10
  };
  
  Hotel.filter(params, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Filter failed', details: err.message });
    
    // Return data and pagination metadata
    res.json({
      status: 'success',
      data: result.data,
      pagination: result.pagination
    });
  });
};

exports.getHotelDetails = (req, res) => {
  const id = req.params.id;
  Hotel.getById(id, (err, hotel) => {
    if (!hotel) return res.status(404).json({ status: 'error', message: 'Hotel not found' });
    res.json({ status: 'success', data: hotel });
  });
};

exports.getAvailability = (req, res) => {
  const id = req.params.id;
  const { check_in } = req.query;
  if (!check_in) return res.status(400).json({ status: 'error', message: 'Missing check_in parameter' });
  Hotel.getRoomTypes(id, (err, roomTypes) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to fetch room types' });
    const results = [];
    let pending = roomTypes.length;
    if (pending === 0) return res.json({ status: 'success', data: [] });
    roomTypes.forEach(rt => {
      Hotel.getAvailability(rt.id, check_in, (err, avail) => {
        results.push({
          roomType: rt.type,
          availableRooms: avail ? avail.available_rooms : 0
        });
        if (--pending === 0) {
          res.json({ status: 'success', data: results });
        }
      });
    });
  });
};

exports.getPricing = (req, res) => {
  const id = req.params.id;
  const { check_in } = req.query;
  if (!check_in) return res.status(400).json({ status: 'error', message: 'Missing check_in parameter' });
  Hotel.getRoomTypes(id, (err, roomTypes) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to fetch room types' });
    const results = [];
    let pending = roomTypes.length;
    if (pending === 0) return res.json({ status: 'success', data: [] });
    roomTypes.forEach(rt => {
      Hotel.getPricing(rt.id, check_in, (err, pricing) => {
        results.push({
          roomType: rt.type,
          price: pricing ? pricing.price : null,
          currency: pricing ? pricing.currency : null
        });
        if (--pending === 0) {
          res.json({ status: 'success', data: results });
        }
      });
    });
  });
};
