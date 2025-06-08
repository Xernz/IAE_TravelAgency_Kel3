import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { FILTER_FLIGHTS } from '../../services/graphqlFlightQueries';
import Pagination from '../common/Pagination';
import './FlightList.css';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Box, TextField, Button } from '@mui/material';


import formatIDR from '../../utils/formatIDR';

export default function FlightList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Or make this configurable

  // UI filter state uses short names; map to GraphQL variable names
  const [filters, setFilters] = useState({
    origin_city: '',
    destination_city: '',
    origin_code: '',
    destination_code: '',
    airline_name: '',
    airline_code: '',
    flight_class: '',
    departure_date: '',
    min_price: '',
    max_price: '',
    sort_by: '',
    sort_order: '',
  });

  // GraphQL query
  const { data, loading, error } = useQuery(FILTER_FLIGHTS, {
    variables: {
      origin_city: filters.origin_city || undefined,
      destination_city: filters.destination_city || undefined,
      origin_code: filters.origin_code || undefined,
      destination_code: filters.destination_code || undefined,
      airline_name: filters.airline_name || undefined,
      airline_code: filters.airline_code || undefined,
      flight_class: filters.flight_class || undefined,
      departure_date: filters.departure_date || undefined,
      min_price: filters.min_price ? parseFloat(filters.min_price) : undefined,
      max_price: filters.max_price ? parseFloat(filters.max_price) : undefined,
      sort_by: filters.sort_by || undefined,
      sort_order: filters.sort_order || undefined,
      page: currentPage,
      limit: itemsPerPage,
    },
    fetchPolicy: 'cache-and-network' // Ensure fresh data on filter changes
  });

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle filter submit
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new filter submission
    // Data will refetch automatically as variables (including currentPage) change
  };



  const flights = data?.filterFlights?.flights || [];
  const paginationInfo = data?.filterFlights?.pagination;

  // Handle page change for pagination
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({
      origin: '',
      destination: '',
      airline: '',
      min_price: '',
      max_price: '',
      date: ''
    });
    setCurrentPage(1);
  };


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
            <Button variant="outlined" onClick={handleResetFilters}>Reset</Button>
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
      {!loading && !error && flights.length > 0 && (
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
                  <TableCell>{flight.origin_city || flight.origin_code}</TableCell>
                  <TableCell>{flight.destination_city || flight.destination_code}</TableCell>
                  <TableCell>{flight.airline_name || flight.airline_code}</TableCell>
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
      {!loading && !error && flights.length === 0 && (
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          No flights found matching your criteria.
        </Paper>
      )}
      {paginationInfo && paginationInfo.total_pages > 1 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={paginationInfo.total_pages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

    </Box>
  );
}
