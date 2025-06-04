// Flight Service - Initial Express Setup
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3002;

// Import sample data
const { flights } = require('./sample_data');

app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'Flight Service is running.' });
});

// List all flights
app.get('/flights', (req, res) => {
  res.json(flights);
});

// Search flights by criteria
app.get('/flights/search', (req, res) => {
  const { from, to, date } = req.query;
  let result = flights;
  if (from) result = result.filter(f => f.from === from);
  if (to) result = result.filter(f => f.to === to);
  if (date) result = result.filter(f => f.date === date);
  res.json(result);
});

// Retrieve flight by ID
app.get('/flights/:id', (req, res) => {
  const flight = flights.find(f => f.flightId === req.params.id);
  if (!flight) {
    return res.status(404).json({ error: 'Not Found', message: `Flight with ID ${req.params.id} not found.` });
  }
  res.json(flight);
});

// Check flight seat availability
app.get('/flights/:id/availability', (req, res) => {
  const flight = flights.find(f => f.flightId === req.params.id);
  if (!flight) {
    return res.status(404).json({ error: 'Not Found', message: `Flight with ID ${req.params.id} not found.` });
  }
  res.json({ flightId: flight.flightId, availableSeats: flight.availableSeats });
});

// Consumer logic: Check bookings for a specific flight by calling Booking Service
app.get('/bookings/by-flight/:flightId', async (req, res) => {
  const bookingServiceUrl = process.env.BOOKING_SERVICE_URL || 'http://localhost:3001';
  try {
    const response = await axios.get(`${bookingServiceUrl}/bookings`);
    const bookings = response.data.filter(b => b.flightId === req.params.flightId);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings from Booking Service', details: err.message });
  }
});

// Endpoint to decrement seat count for a flight
app.post('/flights/decrement-seat', (req, res) => {
  const { flightId } = req.body;
  const flight = flights.find(f => f.flightId === flightId);
  if (!flight) {
    return res.status(404).json({ error: 'Flight not found' });
  }
  if (flight.availableSeats <= 0) {
    return res.status(400).json({ error: 'No seats available' });
  }
  flight.availableSeats -= 1;
  res.json({ flightId, availableSeats: flight.availableSeats });
});

// Endpoint to increment seat count for a flight
app.post('/flights/increment-seat', (req, res) => {
  const { flightId } = req.body;
  const flight = flights.find(f => f.flightId === flightId);
  if (!flight) {
    return res.status(404).json({ error: 'Flight not found' });
  }
  flight.availableSeats += 1;
  res.json({ flightId, availableSeats: flight.availableSeats });
});

app.listen(PORT, () => {
  console.log(`Flight Service listening on port ${PORT}`);
});
