import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useTrains } from '../services/graphqlTrainHooks';
import { Container, Typography } from '@mui/material';
import TrainList from '../components/trains/TrainList';

export default function SearchTrains() {
  const { loading, error, data } = useTrains({ page: 1, limit: 10 });

  if (loading) return <Typography>Loading trains...</Typography>;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;

  return (
    <Container>
      <Typography variant="h4" mb={3} align="center">Cari Kereta</Typography>
      <TrainList trains={data.trains} />
    </Container>
  );
}
