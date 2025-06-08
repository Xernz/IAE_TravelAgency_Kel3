import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_HOTEL_DETAIL } from '../services/graphqlDetailQueries';
import { Typography, Box, CircularProgress } from '@mui/material';

export default function HotelDetail() {
  const { id } = useParams();
  const { loading, error, data } = useQuery(GET_HOTEL_DETAIL, { variables: { id } });

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;

  const hotel = data.hotel;

  return (
    <Box>
      <Typography variant="h4" mb={3} align="center">Detail Hotel</Typography>
      <Typography>{hotel.city}, {hotel.province}, {hotel.kabupaten}, {hotel.postal_code}</Typography>
      <Typography>Tipe: {hotel.property_type}</Typography>
      <Typography>{hotel.description}</Typography>
      {/* Render rooms, etc. */}
    </Box>
  );
}
