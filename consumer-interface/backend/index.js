// Consumer Interface for Booking Flights and Hotels
// This interface consumes the Booking, Flight, and Hotel services
// Provides: Create, Read, Update, Delete, and List bookings for both hotels and flights

const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 4000;

const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:3001';
const FLIGHT_SERVICE_URL = process.env.FLIGHT_SERVICE_URL || 'http://localhost:3002';
const HOTEL_SERVICE_URL = process.env.HOTEL_SERVICE_URL || 'http://localhost:3003';

app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'Consumer Interface Backend is running.' });
});

// Get all bookings (with type filter)
app.get('/bookings', async (req, res) => {
  try {
    const { type } = req.query;
    const response = await axios.get(`${BOOKING_SERVICE_URL}/bookings`, { params: { type } });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings', details: err.message });
  }
});

// Create a new booking (flight, hotel, or both)
app.post('/bookings', async (req, res) => {
  try {
    const response = await axios.post(`${BOOKING_SERVICE_URL}/bookings`, req.body);
    res.status(response.status).json(response.data);
  } catch (err) {
    const error = err.response ? err.response.data : { error: err.message };
    res.status(err.response ? err.response.status : 500).json(error);
  }
});

// Update a booking
app.put('/bookings/:id', async (req, res) => {
  try {
    const response = await axios.put(`${BOOKING_SERVICE_URL}/bookings/${req.params.id}`, req.body);
    res.status(response.status).json(response.data);
  } catch (err) {
    const error = err.response ? err.response.data : { error: err.message };
    res.status(err.response ? err.response.status : 500).json(error);
  }
});

// Delete a booking
app.delete('/bookings/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${BOOKING_SERVICE_URL}/bookings/${req.params.id}`);
    res.status(response.status).json(response.data);
  } catch (err) {
    const error = err.response ? err.response.data : { error: err.message };
    res.status(err.response ? err.response.status : 500).json(error);
  }
});

// Get available flights
app.get('/flights', async (req, res) => {
  try {
    const response = await axios.get(`${FLIGHT_SERVICE_URL}/flights`, { params: req.query });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch flights', details: err.message });
  }
});

// Get available hotels
app.get('/hotels', async (req, res) => {
  try {
    const response = await axios.get(`${HOTEL_SERVICE_URL}/hotels`, { params: req.query });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hotels', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Consumer Interface running on port ${PORT}`);
});
