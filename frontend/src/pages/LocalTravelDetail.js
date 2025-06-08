import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_LOCAL_TRAVEL_DETAIL } from '../services/graphqlDetailQueries';
import { Typography, Box, CircularProgress } from '@mui/material';

export default function LocalTravelDetail() {
  const { id } = useParams();
  const { loading, error, data } = useQuery(GET_LOCAL_TRAVEL_DETAIL, { variables: { id } });

  if (loading) return <CircularProgress />;

  const travel = data.localTravel;

  return (
    <Box sx={{ padding: 3, maxWidth: 600, margin: 'auto' }}>
      <Typography variant="h4" mb={3} align="center">Detail Travel Lokal</Typography>
      <Typography sx={{ marginBottom: 2 }}>{travel.origin} → {travel.destination}</Typography>
      <Typography sx={{ marginBottom: 2 }}>Kendaraan: {travel.vehicle_model}</Typography>
      <Typography sx={{ marginBottom: 2 }}>Harga: {travel.price}</Typography>
      <Typography sx={{ marginBottom: 2 }}>{travel.details}</Typography>
    </Box>
  );
}
