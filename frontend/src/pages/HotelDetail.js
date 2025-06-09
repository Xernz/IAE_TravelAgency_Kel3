import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHotelDetail } from '../services/graphqlHotelHooks';
import { useCreateHotelBooking } from '../services/graphqlBookingHooks';
import { AuthContext } from '../context/AuthContext';
import { Typography, Box, CircularProgress, Button, TextField, Grid, FormControl, InputLabel, Select, MenuItem, Paper, Alert } from '@mui/material';

export default function HotelDetail() {
  const { id: hotelId } = useParams(); // Renamed id to hotelId for clarity
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const { loading: queryLoading, error: queryError, data } = useHotelDetail(hotelId);

  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  // Total price will be calculated or set based on selected room and duration

  const [createHotelBooking, { loading: mutationLoading, error: mutationError, data: mutationData }] = useCreateHotelBooking();

  const handleBooking = async () => {
    if (!currentUser) {
      alert('Please log in to make a booking.');
      navigate('/login');
      return;
    }
    if (!selectedRoomId || !checkInDate || !checkOutDate || numberOfGuests < 1) {
      alert('Please fill in all booking details.');
      return;
    }

    const selectedRoom = data?.hotel?.rooms.find(room => room.id === selectedRoomId);
    if (!selectedRoom) {
        alert('Selected room not found.');
        return;
    }

    // Basic price calculation (price per night * number of nights)
    // More sophisticated calculation might be needed (e.g., from backend or based on dynamic pricing)
    const nights = (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24);
    if (nights <= 0) {
        alert('Check-out date must be after check-in date.');
        return;
    }
    const totalPrice = selectedRoom.price * nights * numberOfGuests; // Simplified, consider guest count impact

    try {
      await createHotelBooking({
        variables: {
          userId: currentUser.id,
          hotelId: hotelId,
          roomTypeId: selectedRoomId,
          checkInDate,
          checkOutDate,
          numberOfGuests: parseInt(numberOfGuests, 10),
          totalPrice,
        },
      });
      // Optionally, redirect to a booking confirmation page or My Bookings
      // alert('Booking successful!'); // Replaced by Alert component
    } catch (e) {
      // Error is handled by mutationError state
      console.error('Booking failed:', e);
    }
  };

  if (queryLoading) return <CircularProgress />;
  if (queryError) return <Typography color="error">Error loading hotel details: {queryError.message}</Typography>;

  const hotel = data?.hotel;
  if (!hotel) return <Typography>Hotel not found.</Typography>;

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', padding: 3 }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h4" mb={2} align="center">{hotel.name}</Typography>
        <Typography variant="subtitle1" color="text.secondary">{hotel.city}, {hotel.province}</Typography>
        <Typography variant="body1" mt={1} mb={2}>{hotel.description}</Typography>
        <Typography variant="h6" mt={3} mb={1}>Property Type: {hotel.property_type}</Typography>

        <Typography variant="h5" mt={4} mb={2}>Book Your Stay</Typography>
        
        {mutationData && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Booking successful! Your booking ID is {mutationData.createHotelBooking.id}.
          </Alert>
        )}
        {mutationError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Booking failed: {mutationError.message}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="room-select-label">Select Room</InputLabel>
              <Select
                labelId="room-select-label"
                value={selectedRoomId}
                label="Select Room"
                onChange={(e) => setSelectedRoomId(e.target.value)}
              >
                {hotel.rooms && hotel.rooms.map((room) => (
                  <MenuItem key={room.id} value={room.id} disabled={room.availability <= 0}>
                    {room.type} - ${room.price}/night (Availability: {room.availability})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Number of Guests"
              type="number"
              value={numberOfGuests}
              onChange={(e) => setNumberOfGuests(e.target.value)}
              fullWidth
              margin="normal"
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Check-in Date"
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Check-out Date"
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleBooking} 
          disabled={mutationLoading || !selectedRoomId || !checkInDate || !checkOutDate}
          sx={{ mt: 3, display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
        >
          {mutationLoading ? <CircularProgress size={24} /> : 'Book Now'}
        </Button>
      </Paper>
    </Box>
  );
}
