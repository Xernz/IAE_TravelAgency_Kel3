import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_TRAIN_DETAIL } from '../services/graphqlDetailQueries';
import { Typography, Box, CircularProgress } from '@mui/material';

export default function TrainDetail() {
  const { id } = useParams();
  const { loading, error, data } = useQuery(GET_TRAIN_DETAIL, { variables: { id } });

  if (loading) return <CircularProgress />;

  const train = data.train;

  return (
    <Box sx={{ padding: 3, maxWidth: 600, margin: 'auto' }}>
      <Typography variant="h4" mb={3} align="center">Detail Kereta</Typography>
      <Typography sx={{ marginBottom: 2 }}>{train.origin_province} → {train.destination_province}</Typography>
      <Typography sx={{ marginBottom: 2 }}>Subkelas: {train.subclass}</Typography>
      <Typography sx={{ marginBottom: 2 }}>Tipe: {train.train_type}</Typography>
      <Typography sx={{ marginBottom: 2 }}>Kategori Harga: {train.price_category}</Typography>
      <Typography sx={{ marginBottom: 2 }}>{train.details}</Typography>
    </Box>
  );
}
