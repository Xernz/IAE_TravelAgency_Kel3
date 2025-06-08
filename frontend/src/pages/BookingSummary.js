import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_BOOKING_SUMMARY, CREATE_BOOKING } from '../graphql/queries';
import { Box, Typography, Paper, Button, Alert, CircularProgress } from '@mui/material';

export default function BookingSummary() {
  const { loading, error, data } = useQuery(GET_BOOKING_SUMMARY);
  const [createBooking, { loading: creating }] = useMutation(CREATE_BOOKING);
  const { showSnackbar } = React.useContext(SnackbarContext);

  const selectedFlight = JSON.parse(localStorage.getItem('selectedFlight') || 'null');
  const selectedHotel = JSON.parse(localStorage.getItem('selectedHotel') || 'null');
  const selectedLocalTravel = JSON.parse(localStorage.getItem('selectedLocalTravel') || 'null');
  const selectedTrain = JSON.parse(localStorage.getItem('selectedTrain') || 'null');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleCreate = async () => {
    try {
      const bookingItems = [];
      if (selectedFlight) bookingItems.push({ type: 'flight', refId: selectedFlight.id });
      if (selectedHotel) bookingItems.push({ type: 'hotel', refId: selectedHotel.id });
      if (selectedLocalTravel) bookingItems.push({ type: 'local_travel', refId: selectedLocalTravel.id });
      if (selectedTrain) bookingItems.push({ type: 'train', refId: selectedTrain.id });
      await createBooking({ variables: { userId: user.id, items: bookingItems } });
      showSnackbar('Pemesanan berhasil dibuat!', 'success');
      // Clear selections
      localStorage.removeItem('selectedFlight');
      localStorage.removeItem('selectedHotel');
      localStorage.removeItem('selectedLocalTravel');
      localStorage.removeItem('selectedTrain');
    } catch (err) {
      showSnackbar('Gagal membuat pemesanan: ' + (err.message || 'Terjadi kesalahan'), 'error');
    }
  };

  if (loading) return <Typography>Memuat ringkasan...</Typography>;
  if (error) return <Typography color="error">Gagal memuat ringkasan: {error.message}</Typography>;



  return (
    <Box maxWidth={600} mx="auto" mt={6}>
      <Typography variant="h5" mb={2}>Booking Summary</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Booking Confirmed! Booking ID: {bookingId}</Alert>}
      <Paper sx={{ p: 2, mb: 2 }}>
        {selectedFlight && <Typography>Flight: {selectedFlight.flight_number} ({selectedFlight.origin} → {selectedFlight.destination})</Typography>}
        {selectedHotel && <Typography>Hotel: {selectedHotel.name} ({selectedHotel.location})</Typography>}
        {selectedLocalTravel && <Typography>Local Travel: {selectedLocalTravel.name} ({selectedLocalTravel.type})</Typography>}
        {selectedTrain && <Typography>Train: {selectedTrain.name} ({selectedTrain.origin} → {selectedTrain.destination})</Typography>}
        {!(selectedFlight || selectedHotel || selectedLocalTravel || selectedTrain) && <Typography>No item selected for booking.</Typography>}
      </Paper>
      <Button variant="contained" color="primary"
        disabled={!(selectedFlight || selectedHotel || selectedLocalTravel || selectedTrain) || loading || !user}
        onClick={handleCreate}>
        {loading ? <CircularProgress size={24} /> : 'Confirm Booking'}
      </Button>
      {!user && <Alert severity="warning" sx={{ mt: 2 }}>You must be logged in to confirm a booking.</Alert>}
    </Box>
  );
}
