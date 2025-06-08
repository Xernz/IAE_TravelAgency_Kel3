import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_FLIGHTS } from '../services/graphqlQueries';
import { Box, Typography } from '@mui/material';
import FlightList from '../components/flights/FlightList';

export default function SearchFlights() {
  const { loading, error, data } = useQuery(GET_FLIGHTS, { variables: { page: 1, limit: 10 } });

  if (loading) return <Typography>Loading flights...</Typography>;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;

  return (
    <Box>
      <Typography variant="h4" mb={3} align="center">Cari Penerbangan</Typography>
      <FlightList flights={data.flights} />
    </Box>
  );
}
