import React from 'react';
import { Container, Typography, Box, AppBar, Toolbar, Paper, Grid } from '@mui/material';
import BookingManager from './components/BookingManager';
import FlightBrowser from './components/FlightBrowser';
import HotelBrowser from './components/HotelBrowser';

export default function App() {
  // For BookingManager interaction:
  const bookingManagerRef = React.useRef();
  // Track booking type for filtering which browser to show
  const [bookingType, setBookingType] = React.useState('flight');

  // Handlers to auto-fill booking form
  const handleFlightSelect = (flight) => {
    if (bookingManagerRef.current && bookingManagerRef.current.setFlightBooking) {
      bookingManagerRef.current.setFlightBooking(flight);
      setBookingType('flight');
    }
  };
  const handleHotelSelect = (hotel) => {
    if (bookingManagerRef.current && bookingManagerRef.current.setHotelBooking) {
      bookingManagerRef.current.setHotelBooking(hotel);
      setBookingType('hotel');
    }
  };

  // Listen to booking type changes from BookingManager
  const handleBookingTypeChange = (newType) => {
    setBookingType(newType);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Travel Agency Consumer Interface
          </Typography>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <BookingManager ref={bookingManagerRef} bookingType={bookingType} onBookingTypeChange={handleBookingTypeChange} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            {bookingType === 'flight' && (
              <Paper sx={{ p: 2, mb: 2 }}>
                <FlightBrowser onSelect={handleFlightSelect} />
              </Paper>
            )}
            {bookingType === 'hotel' && (
              <Paper sx={{ p: 2 }}>
                <HotelBrowser onSelect={handleHotelSelect} />
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
