import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_FLIGHTS } from '../../services/graphqlQueries';
import Pagination from '../common/Pagination';
import './FlightList.css';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Box, TextField, Button } from '@mui/material';


import formatIDR from '../../utils/formatIDR';

export default function FlightList() {

  const [filters, setFilters] = useState({
    origin: '',
    destination: '',
    airline: '',
    min_price: '',
    max_price: '',
    date: ''
  });

  // GraphQL query
  const { data, loading, error, refetch } = useQuery(GET_FLIGHTS, {
    variables: {
      origin: filters.origin || undefined,
      destination: filters.destination || undefined,
      date: filters.date || undefined,
    }
  });

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle filter submit
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    refetch();
  };



  const flights = data?.flights || [];


  return (
    <Box p={2}>
      {/* Filter Form */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <form onSubmit={handleFilterSubmit}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              label="Origin"
              name="origin"
              value={filters.origin}
              onChange={handleFilterChange}
              size="small"
            />
            <TextField
              label="Destination"
              name="destination"
              value={filters.destination}
              onChange={handleFilterChange}
              size="small"
            />
            <TextField
              label="Airline"
              name="airline"
              value={filters.airline}
              onChange={handleFilterChange}
              size="small"
            />
            <TextField
              label="Min Price"
              name="min_price"
              value={filters.min_price}
              onChange={handleFilterChange}
              size="small"
              type="number"
            />
            <TextField
              label="Max Price"
              name="max_price"
              value={filters.max_price}
              onChange={handleFilterChange}
              size="small"
              type="number"
            />
            <Button type="submit" variant="contained" color="primary">Filter</Button>
          </Box>
        </form>
      </Paper>
      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
          <CircularProgress />
        </Box>
      )}
      {/* Error State */}
      {error && (
        <Box color="error.main" p={2}>
          Error loading flights.
        </Box>
      )}
      {/* Flights Table */}
      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Origin</TableCell>
                <TableCell>Destination</TableCell>
                <TableCell>Airline</TableCell>
                <TableCell>Departure</TableCell>
                <TableCell>Arrival</TableCell>
                <TableCell>Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flights.length > 0 ? flights.map(flight => (
                <TableRow key={flight.id}>
                  <TableCell>{flight.origin}</TableCell>
                  <TableCell>{flight.destination}</TableCell>
                  <TableCell>{flight.airline}</TableCell>
                  <TableCell>{flight.departure_time}</TableCell>
                  <TableCell>{flight.arrival_time}</TableCell>
                  <TableCell>{formatIDR(flight.price)}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">No flights found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

    </Box>
  );
}
