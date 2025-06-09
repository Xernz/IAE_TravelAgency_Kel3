import React, { createContext, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Container, Snackbar, Alert } from '@mui/material';
import NavBar from './components/NavBar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import SearchFlights from './pages/SearchFlights';
import SearchHotels from './pages/SearchHotels';
import SearchLocalTravel from './pages/SearchLocalTravel';
import SearchTrains from './pages/SearchTrains';
import { ApolloProvider } from '@apollo/client';
import { client } from './services/graphql';
import { useHotels } from './services/graphqlHotelHooks';
export const SnackbarContext = createContext({ showSnackbar: () => {} });

function SnackbarProvider({ children }) {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);
  const handleClose = () => setSnackbar(s => ({ ...s, open: false }));
  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}
// Usage: const { showSnackbar } = React.useContext(SnackbarContext); showSnackbar('Berhasil!', 'success');

// ...rest of imports

function HomePage() {
  const { loading, error, data } = useHotels();

  if (loading) return <p>Loading hotels...</p>;
  if (error) return <p>Error loading hotels: {error.message}</p>;

  return (
    <div>
      <h2>Hotel List (GraphQL)</h2>
      <ul>
        {data.hotels.map(hotel => (
          <li key={hotel.id}>
            <strong>{hotel.name}</strong> — {hotel.city}, {hotel.province}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Bookings() { return <h2>User Bookings</h2>; }
function BookingDetails() { return <h2>Booking Details</h2>; }
function PaymentStatus() { return <h2>Payment Status</h2>; }

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <CssBaseline />
        <SnackbarProvider>
          <NavBar />
          <Container sx={{ mt: 4 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/search/flights" element={<SearchFlights />} />
              <Route path="/search/hotels" element={<SearchHotels />} />
              <Route path="/search/local-travel" element={<SearchLocalTravel />} />
              <Route path="/search/trains" element={<SearchTrains />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/booking/:id" element={<BookingDetails />} />
              <Route path="/payment/:id" element={<PaymentStatus />} />
            </Routes>
          </Container>
        </SnackbarProvider>
      </Router>
    </ApolloProvider>
  );
}

export default App;
