import React from 'react';
import { useHotels } from '../services/graphql';
import { Box, Typography } from '@mui/material';
import HotelList from '../components/hotels/HotelList';

export default function SearchHotels() {
  const { loading, error, data } = useHotels(1, 10);

  if (loading) return <Typography>Loading hotels...</Typography>;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;

  return (
    <Box>
      <Typography variant="h4" mb={3} align="center">Cari Hotel</Typography>
      <HotelList hotels={data && data.hotels ? data.hotels : []} />
    </Box>
  );
}
