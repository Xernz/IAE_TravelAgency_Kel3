import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Box, Typography, Button, TextField, Grid, Paper, List, ListItem, ListItemText, IconButton, ToggleButton, ToggleButtonGroup } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const API_URL = 'http://localhost:4000';

const BookingManager = forwardRef((props, ref) => {
  const { bookingType, onBookingTypeChange } = props;
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ customerId: '', flightId: '', hotelId: '', startDate: '', endDate: '', date: '' });
  const [editingId, setEditingId] = useState(null);

  // Fetch only bookings of the current type
  const fetchBookings = async () => {
    const res = await fetch(`${API_URL}/bookings?type=${bookingType}`);
    setBookings(await res.json());
  };

  useEffect(() => { fetchBookings(); }, [bookingType]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBookingType = (event, newType) => {
    if (newType && newType !== bookingType) {
      onBookingTypeChange && onBookingTypeChange(newType);
      setForm(f => ({ ...f, flightId: '', hotelId: '', startDate: '', endDate: '', date: '' })); // reset the other field
      setEditingId(null);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    let payload = { ...form };
    // Prepare payload based on booking type
    if (bookingType === 'flight') {
      payload.hotelId = '';
      payload.startDate = '';
      payload.endDate = '';
      // Ensure date is set and matches the selected flight (if possible)
      if (!payload.flightId || !payload.date) {
        alert('Please provide both Flight ID and Date for flight bookings.');
        return;
      }
    } else if (bookingType === 'hotel') {
      payload.flightId = '';
      payload.date = '';
      // Ensure startDate and endDate are set
      if (!payload.hotelId || !payload.startDate || !payload.endDate) {
        alert('Please provide Hotel ID, Start Date, and End Date for hotel bookings.');
        return;
      }
    }
    if (editingId) {
      await fetch(`${API_URL}/bookings/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    setForm({ customerId: '', flightId: '', hotelId: '', startDate: '', endDate: '', date: '' });
    setEditingId(null);
    fetchBookings();
  };

  const handleDelete = async id => {
    await fetch(`${API_URL}/bookings/${id}`, { method: 'DELETE' });
    fetchBookings();
  };

  const handleEdit = booking => {
    setForm({
      customerId: booking.customerId || '',
      flightId: booking.flightId || '',
      hotelId: booking.hotelId || '',
      startDate: booking.startDate || '',
      endDate: booking.endDate || '',
      date: booking.date || ''
    });
    setEditingId(booking.bookingId);
    if (booking.flightId) {
      onBookingTypeChange && onBookingTypeChange('flight');
    } else {
      onBookingTypeChange && onBookingTypeChange('hotel');
    }
  };

  const handleCancelEdit = () => {
    setForm({ customerId: '', flightId: '', hotelId: '', startDate: '', endDate: '', date: '' });
    setEditingId(null);
  };

  useImperativeHandle(ref, () => ({
    setFlightBooking: (flight) => {
      onBookingTypeChange && onBookingTypeChange('flight');
      setForm(f => ({ ...f, flightId: flight.flightId, hotelId: '', startDate: '', endDate: '', date: flight.date || '', customerId: f.customerId }));
      setEditingId(null);
    },
    setHotelBooking: (hotel) => {
      onBookingTypeChange && onBookingTypeChange('hotel');
      setForm(f => ({ ...f, hotelId: hotel.hotelId, flightId: '', startDate: '', endDate: '', date: '', customerId: f.customerId }));
      setEditingId(null);
    }
  }));

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Manage Bookings</Typography>
      <Box mb={2}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <ToggleButtonGroup
              value={bookingType}
              exclusive
              onChange={handleBookingType}
              aria-label="Booking Type"
            >
              <ToggleButton value="flight">Flight Booking</ToggleButton>
              <ToggleButton value="hotel">Hotel Booking</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item>
            <Button variant="outlined" color="primary" onClick={fetchBookings}>Refresh</Button>
          </Grid>
        </Grid>
      </Box>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={2}>
            <TextField label="Customer ID" name="customerId" value={form.customerId} onChange={handleChange} required fullWidth />
          </Grid>
          {bookingType === 'flight' && (
            <>
              <Grid item xs={12} sm={2}>
                <TextField label="Flight ID" name="flightId" value={form.flightId} onChange={handleChange} required fullWidth />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField label="Date" name="date" type="date" value={form.date || ''} onChange={handleChange} required fullWidth InputLabelProps={{ shrink: true }} />
              </Grid>
            </>
          )}
          {bookingType === 'hotel' && (
            <>
              <Grid item xs={12} sm={2}>
                <TextField label="Hotel ID" name="hotelId" value={form.hotelId} onChange={handleChange} required fullWidth />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField label="Start Date" name="startDate" type="date" value={form.startDate || ''} onChange={handleChange} required fullWidth InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField label="End Date" name="endDate" type="date" value={form.endDate || ''} onChange={handleChange} required fullWidth InputLabelProps={{ shrink: true }} />
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={2}>
            <Button type="submit" variant="contained" color="primary" fullWidth>{editingId ? 'Update' : 'Book'}</Button>
          </Grid>
          {editingId && (
            <Grid item xs={12} sm={2}>
              <Button variant="outlined" color="secondary" fullWidth onClick={handleCancelEdit}>Cancel</Button>
            </Grid>
          )}
        </Grid>
      </form>
      <Paper>
        <List>
          {bookings.map(booking => (
            <ListItem key={booking.bookingId} secondaryAction={
              <>
                <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(booking)}><EditIcon /></IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(booking.bookingId)}><DeleteIcon /></IconButton>
              </>
            }>
              <ListItemText
                primary={`Booking #${booking.bookingId}`}
                secondary={
                  `Customer: ${booking.customerId}` +
                  (bookingType === 'flight'
                    ? ` | Flight: ${booking.flightId} | Date: ${booking.date}`
                    : ` | Hotel: ${booking.hotelId} | ${booking.startDate} to ${booking.endDate}`)
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
});

export default BookingManager;
