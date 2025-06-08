import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_LOCAL_TRAVEL_DETAIL } from '../services/graphqlDetailQueries';
import { CREATE_LOCAL_TRAVEL_BOOKING } from '../services/graphqlQueries'; // Added
import { AuthContext } from '../context/AuthContext'; // Added
import {
  Typography, Box, CircularProgress, Button, Alert, Paper, Grid // Added form components
} from '@mui/material';

export default function LocalTravelDetail() {
  const { id: localTravelId } = useParams(); // Renamed id for clarity
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  // State for booking
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Get local travel details query
  const { loading: queryLoading, error: queryError, data } = useQuery(GET_LOCAL_TRAVEL_DETAIL, { 
    variables: { id: localTravelId } 
  });

  // Create local travel booking mutation
  const [createLocalTravelBooking, { loading: mutationLoading }] = useMutation(CREATE_LOCAL_TRAVEL_BOOKING, {
    onError: (error) => {
      setBookingError(`Booking failed: ${error.message}`);
      setBookingSuccess(null);
    },
    onCompleted: (mutationData) => {
      setBookingSuccess(`Booking successful! Booking ID: ${mutationData.createLocalTravel.id}. You will be redirected to My Bookings shortly.`);
      setBookingError(null);
      setTimeout(() => navigate('/my-bookings'), 3000); // Redirect after a delay
    }
  });

  const handleBooking = async () => {
    setBookingError(null);
    setBookingSuccess(null);

    if (!currentUser) {
      setBookingError('You must be logged in to book local travel.');
      navigate('/login');
      return;
    }

    if (!localTravelId) {
      setBookingError('Local travel ID is missing. Cannot proceed with booking.');
      return;
    }

    try {
      await createLocalTravelBooking({
        variables: {
          userId: currentUser.id,
          localTravelId: localTravelId,
        }
      });
    } catch (err) {
      // Error is handled by onError in useMutation
      console.error('Booking submission error:', err);
    }
  };

  if (queryLoading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  if (queryError) return <Alert severity="error">Error loading local travel details: {queryError.message}</Alert>;
  if (!data || !data.localTravel) return <Alert severity="warning">Local travel details not found.</Alert>;

  const travel = data.localTravel;

  return (
    <Box sx={{ padding: 3, maxWidth: 800, margin: '20px auto' }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h4" mb={3} align="center">Detail Travel Lokal: {travel.name}</Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>Informasi Perjalanan</Typography>
            <Typography><b>Rute:</b> {travel.origin} → {travel.destination}</Typography>
            <Typography><b>Kendaraan:</b> {travel.vehicle_model}</Typography>
            <Typography><b>Harga:</b> Rp {travel.price?.toLocaleString()}</Typography>
            {travel.details && <Typography sx={{ mt: 1 }}><b>Detail Tambahan:</b> {travel.details}</Typography>}
          </Grid>

          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleBooking}
              disabled={mutationLoading}
              fullWidth
              sx={{ mt: 2, py: 1.5 }}
            >
              {mutationLoading ? <CircularProgress size={24} /> : 'Pesan Sekarang'}
            </Button>
          </Grid>
        </Grid>

        {bookingError && <Alert severity="error" sx={{ mt: 3 }}>{bookingError}</Alert>}
        {bookingSuccess && <Alert severity="success" sx={{ mt: 3 }}>{bookingSuccess}</Alert>}
      </Paper>
    </Box>
  );
}
