// Hotel Service - Initial Express Setup
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

// Import sample data
const { hotels } = require('./sample_data');

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'Hotel Service is running.' });
});

// List all hotels
app.get('/hotels', (req, res) => {
  res.json(hotels);
});

// Get hotel by ID
app.get('/hotels/:id', (req, res) => {
  const hotel = hotels.find(h => h.hotelId === req.params.id);
  if (!hotel) {
    return res.status(404).json({ error: 'Not Found', message: `Hotel with ID ${req.params.id} not found.` });
  }
  res.json(hotel);
});

// Check hotel room availability
app.get('/hotels/:id/availability', (req, res) => {
  const hotel = hotels.find(h => h.hotelId === req.params.id);
  if (!hotel) {
    return res.status(404).json({ error: 'Not Found', message: `Hotel with ID ${req.params.id} not found.` });
  }
  res.json({ hotelId: hotel.hotelId, availableRooms: hotel.availableRooms });
});

// Consumer logic: Check bookings for a specific hotel by calling Booking Service
app.get('/bookings/by-hotel/:hotelId', async (req, res) => {
  const bookingServiceUrl = process.env.BOOKING_SERVICE_URL || 'http://localhost:3001';
  try {
    const response = await axios.get(`${bookingServiceUrl}/bookings`);
    const bookings = response.data.filter(b => b.hotelId === req.params.hotelId);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings from Booking Service', details: err.message });
  }
});

// Endpoint to decrement room count for a hotel
app.post('/hotels/decrement-room', (req, res) => {
  const { hotelId } = req.body;
  const hotel = hotels.find(h => h.hotelId === hotelId);
  if (!hotel) {
    return res.status(404).json({ error: 'Hotel not found' });
  }
  if (hotel.availableRooms <= 0) {
    return res.status(400).json({ error: 'No rooms available' });
  }
  hotel.availableRooms -= 1;
  res.json({ hotelId, availableRooms: hotel.availableRooms });
});

// Endpoint to increment room count for a hotel
app.post('/hotels/increment-room', (req, res) => {
  const { hotelId } = req.body;
  const hotel = hotels.find(h => h.hotelId === hotelId);
  if (!hotel) {
    return res.status(404).json({ error: 'Hotel not found' });
  }
  hotel.availableRooms += 1;
  res.json({ hotelId, availableRooms: hotel.availableRooms });
});

app.listen(PORT, () => {
  console.log(`Hotel Service listening on port ${PORT}`);
});
