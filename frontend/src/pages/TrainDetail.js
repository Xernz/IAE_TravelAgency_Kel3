import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrainDetail } from '../services/graphqlTrainHooks';
import { useCreateTrainBooking } from '../services/graphqlBookingHooks';
import { AuthContext } from '../context/AuthContext'; // Added
import {
  Typography, Box, CircularProgress, TextField, Button, Alert, Paper, Grid // Added form components
} from '@mui/material';

export default function TrainDetail() {
  const { id: trainId } = useParams(); // Renamed id for clarity
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  // State for booking form
  const [numberOfSeats, setNumberOfSeats] = useState(1);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Get train details query
  const { loading: queryLoading, error: queryError, data } = useTrainDetail(trainId);

  // Create train booking mutation
  const [createTrainBooking, { loading: mutationLoading }] = useCreateTrainBooking({
    onError: (error) => {
      setBookingError(`Booking failed: ${error.message}`);
      setBookingSuccess(null);
    },
    onCompleted: (mutationData) => {
      setBookingSuccess(`Booking successful! Booking ID: ${mutationData.createTrain.id}. You will be redirected to My Bookings shortly.`);
      setBookingError(null);
      setTimeout(() => navigate('/my-bookings'), 3000); // Redirect after a delay
    }
  });

  const handleBooking = async (event) => {
    event.preventDefault();
    setBookingError(null);
    setBookingSuccess(null);

    if (!currentUser) {
      setBookingError('You must be logged in to book a train ticket.');
      navigate('/login');
      return;
    }

    if (!trainId || numberOfSeats <= 0) {
      setBookingError('Please ensure all booking details are correct.');
      return;
    }

    try {
      await createTrainBooking({
        variables: {
          userId: currentUser.id,
          trainId: trainId,
          numberOfSeats: parseInt(numberOfSeats, 10),
        }
      });
    } catch (err) {
      // Error is handled by onError in useMutation
      console.error('Booking submission error:', err);
    }
  };

  if (queryLoading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  if (queryError) return <Alert severity="error">Error loading train details: {queryError.message}</Alert>;
  if (!data || !data.train) return <Alert severity="warning">Train details not found.</Alert>;

  const train = data.train;

  return (
    <Box sx={{ padding: 3, maxWidth: 800, margin: '20px auto' }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h4" mb={3} align="center">Detail Kereta: {train.train_name}</Typography>
        
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Informasi Perjalanan</Typography>
            <Typography><b>Rute:</b> {train.origin_province} → {train.destination_province}</Typography>
            <Typography><b>Nama Kereta:</b> {train.train_name}</Typography>
            <Typography><b>Subkelas:</b> {train.subclass}</Typography>
            <Typography><b>Tipe Kereta:</b> {train.train_type}</Typography>
            <Typography><b>Kategori Harga:</b> {train.price_category}</Typography>
            {/* Assuming price might come from details or a separate field not shown in GET_TRAIN_DETAIL, or needs to be calculated based on price_category and numberOfSeats. For now, not displaying price. */}
            {train.details && <Typography sx={{ mt: 1 }}><b>Detail Tambahan:</b> {train.details}</Typography>}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Formulir Pemesanan</Typography>
            <Box component="form" onSubmit={handleBooking} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="numberOfSeats"
                label="Jumlah Kursi"
                name="numberOfSeats"
                type="number"
                InputProps={{ inputProps: { min: 1 } }} // Assuming seats_available check might be done on backend or not available in GET_TRAIN_DETAIL
                value={numberOfSeats}
                onChange={(e) => setNumberOfSeats(e.target.value)}
                disabled={mutationLoading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={mutationLoading}
              >
                {mutationLoading ? <CircularProgress size={24} /> : 'Pesan Tiket Kereta'}
              </Button>
            </Box>
          </Grid>
        </Grid>

        {bookingError && <Alert severity="error" sx={{ mt: 2 }}>{bookingError}</Alert>}
        {bookingSuccess && <Alert severity="success" sx={{ mt: 2 }}>{bookingSuccess}</Alert>}
      </Paper>
    </Box>
  );
}
