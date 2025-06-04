// Booking Service - Initial Express Setup
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3001;

// Import sample data
const { bookings: sampleBookings } = require('./sample_data');

app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'Booking Service is running.' });
});

// In-memory storage for bookings only
let bookings = [...sampleBookings];

// Create a new booking
app.post('/bookings', async (req, res) => {
  const { customerId, flightId, hotelId, startDate, endDate, date } = req.body;
  if (!customerId || (flightId && !date) || (hotelId && (!startDate || !endDate))) {
    return res.status(400).json({ error: 'Missing required fields for booking.' });
  }
  if (!flightId && !hotelId) {
    return res.status(400).json({ error: 'At least one of flightId or hotelId must be provided.' });
  }
  // NOTE: In a real system, check seat/room availability via Flight/Hotel Service API here
  try {
    if (flightId) {
      // Decrement seat count for the flight
      await axios.post('http://localhost:3002/flights/decrement-seat', { flightId });
    } else if (hotelId) {
      // Decrement room count for the hotel
      await axios.post('http://localhost:3003/hotels/decrement-room', { hotelId, startDate, endDate });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update seat/room availability', details: err.message });
  }
  const bookingId = `BKG${Date.now()}`;
  const newBooking = {
    bookingId,
    customerId,
    flightId: flightId || null,
    hotelId: hotelId || null,
    startDate: hotelId ? startDate : undefined,
    endDate: hotelId ? endDate : undefined,
    date: flightId ? date : undefined,
    status: 'confirmed',
  };
  bookings.push(newBooking);
  res.status(201).json({ bookingId, status: 'confirmed', details: newBooking });
});

// List all bookings, with optional type filter
app.get('/bookings', (req, res) => {
  const { type } = req.query;
  let filtered = bookings;
  if (type === 'flight') {
    filtered = bookings.filter(b => b.flightId && !b.hotelId);
  } else if (type === 'hotel') {
    filtered = bookings.filter(b => b.hotelId && !b.flightId);
  }
  res.json(filtered);
});

// Retrieve booking by ID
app.get('/bookings/:id', (req, res) => {
  const booking = bookings.find(b => b.bookingId === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Not Found', message: `Booking with ID ${req.params.id} not found.` });
  }
  res.json(booking);
});

// Update a booking
app.put('/bookings/:id', (req, res) => {
  const idx = bookings.findIndex(b => b.bookingId === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Not Found', message: `Booking with ID ${req.params.id} not found.` });
  }
  const { customerId, flightId, hotelId, startDate, endDate, status } = req.body;
  // Only allow update for one type at a time
  let updated = { ...bookings[idx], customerId, startDate, endDate, status };
  if (flightId && !hotelId) {
    updated.flightId = flightId;
    updated.hotelId = null;
  } else if (hotelId && !flightId) {
    updated.hotelId = hotelId;
    updated.flightId = null;
  }
  bookings[idx] = updated;
  res.json(bookings[idx]);
});

// Delete a booking
app.delete('/bookings/:id', async (req, res) => {
  const bookingIndex = bookings.findIndex(b => b.bookingId === req.params.id);
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  const booking = bookings[bookingIndex];
  try {
    if (booking.flightId) {
      // Increment seat count for the flight
      await axios.post('http://localhost:3002/flights/increment-seat', { flightId: booking.flightId });
    } else if (booking.hotelId) {
      // Increment room count for the hotel
      await axios.post('http://localhost:3003/hotels/increment-room', { hotelId: booking.hotelId });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update seat/room availability', details: err.message });
  }
  bookings.splice(bookingIndex, 1);
  res.json({ message: 'Booking deleted and inventory updated.' });
});

app.listen(PORT, () => {
  console.log(`Booking Service listening on port ${PORT}`);
});
