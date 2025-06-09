import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFlightDetail } from '../services/graphqlFlightHooks';
import { useCreateFlightBooking } from '../services/graphqlBookingHooks';
import { AuthContext } from '../context/AuthContext'; // Added
import {
  Typography, Box, CircularProgress, TextField, Button, Alert, Paper, Grid // Added form components
} from '@mui/material';

export default function FlightDetail() {
  const { id: flightId } = useParams(); // Renamed id to flightId for clarity
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  // State for booking form
  const [numberOfPassengers, setNumberOfPassengers] = useState(1);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Get flight details query
  const { loading: queryLoading, error: queryError, data } = useFlightDetail(flightId);

  // Create flight booking mutation
  const [createFlightBooking, { loading: mutationLoading }] = useCreateFlightBooking({
    onError: (error) => {
      setBookingError(`Booking failed: ${error.message}`);
      setBookingSuccess(null);
    },
    onCompleted: (data) => {
      setBookingSuccess(`Booking successful! Booking ID: ${data.createFlight.id}. You will be redirected to My Bookings shortly.`);
      setBookingError(null);
      setTimeout(() => navigate('/my-bookings'), 3000); // Redirect after a delay
    }
  });

  const handleBooking = async (event) => {
    event.preventDefault();
    setBookingError(null);
    setBookingSuccess(null);

    if (!currentUser) {
      setBookingError('You must be logged in to book a flight.');
      navigate('/login');
      return;
    }

    if (!flightId || numberOfPassengers <= 0) {
      setBookingError('Please ensure all booking details are correct.');
      return;
    }

    try {
      await createFlightBooking({
        variables: {
          userId: currentUser.id,
          flightId: flightId,
          numberOfPassengers: parseInt(numberOfPassengers, 10),
        }
      });
    } catch (err) {
      // Error is handled by onError in useMutation
      console.error('Booking submission error:', err);
    }
  };

  if (queryLoading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  if (queryError) return <Alert severity="error">Error loading flight details: {queryError.message}</Alert>;
  if (!data || !data.flight) return <Alert severity="warning">Flight details not found.</Alert>;

  const flight = data.flight;

  return (
    <Box sx={{ padding: 3, maxWidth: 800, margin: '20px auto' }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h4" mb={3} align="center">Detail Penerbangan</Typography>
        
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Informasi Penerbangan</Typography>
            <Typography><b>Maskapai:</b> {flight.airline}</Typography>
            <Typography><b>Nomor Penerbangan:</b> {flight.flight_number}</Typography>
            <Typography><b>Rute:</b> {flight.origin} → {flight.destination}</Typography>
            <Typography><b>Keberangkatan:</b> {new Date(flight.departure_time).toLocaleString()}</Typography>
            <Typography><b>Kedatangan:</b> {new Date(flight.arrival_time).toLocaleString()}</Typography>
            <Typography><b>Harga per Tiket:</b> Rp {flight.price?.toLocaleString()}</Typography>
            <Typography><b>Ketersediaan Kursi:</b> {flight.seats_available}</Typography>
            {flight.details && <Typography><b>Keterangan:</b> {flight.details}</Typography>}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Formulir Pemesanan</Typography>
            <Box component="form" onSubmit={handleBooking} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="numberOfPassengers"
                label="Jumlah Penumpang"
                name="numberOfPassengers"
                type="number"
                InputProps={{ inputProps: { min: 1 } }}
                value={numberOfPassengers}
                onChange={(e) => setNumberOfPassengers(e.target.value)}
                disabled={mutationLoading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={mutationLoading || !flight.seats_available || numberOfPassengers > flight.seats_available}
              >
                {mutationLoading ? <CircularProgress size={24} /> : 'Pesan Sekarang'}
              </Button>
              {numberOfPassengers > flight.seats_available && (
                <Alert severity="warning" sx={{ mt: 1 }}>Jumlah penumpang melebihi kursi yang tersedia.</Alert>
              )}
            </Box>
          </Grid>
        </Grid>

        {bookingError && <Alert severity="error" sx={{ mt: 2 }}>{bookingError}</Alert>}
        {bookingSuccess && <Alert severity="success" sx={{ mt: 2 }}>{bookingSuccess}</Alert>}
      </Paper>
    </Box>
  );
}
