import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_FLIGHT_DETAIL } from '../services/graphqlDetailQueries';
import { Typography, Box, CircularProgress } from '@mui/material';

export default function FlightDetail() {
  const { id } = useParams();
  const { loading, error, data } = useQuery(GET_FLIGHT_DETAIL, { variables: { id } });

  if (loading) return <CircularProgress />;

  const flight = data.flight;

  return (
    <Box sx={{ padding: 3, maxWidth: 600, margin: 'auto' }}>
      <Typography variant="h4" mb={3} align="center">Detail Penerbangan</Typography>
      <Typography variant="h6" mb={2}>Informasi Penerbangan</Typography>
      <Typography>Rute: {flight.origin} → {flight.destination}</Typography>
      <Typography>Waktu Keberangkatan: {flight.departure_time}</Typography>
      <Typography>Waktu Kedatangan: {flight.arrival_time}</Typography>
      <Typography>Harga: {flight.price}</Typography>
      <Typography>Keterangan: {flight.details}</Typography>
    </Box>
  );
}
