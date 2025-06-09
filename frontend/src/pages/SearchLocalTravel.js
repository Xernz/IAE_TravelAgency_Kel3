import React, { useState } from 'react';
import { useLocalTravels } from '../services/graphqlLocalTravelHooks';
import { Box, Container, Typography } from '@mui/material';
import LocalTravelList from '../components/localtravel/LocalTravelList';

export default function SearchLocalTravel() {
  const { loading, error, data } = useLocalTravels({ page: 1, limit: 10 });

  if (loading) return <Typography>Loading local travel options...</Typography>;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;

  return (
    <Container>
      <Typography variant="h4" mb={3} align="center">Cari Travel Lokal</Typography>
      <LocalTravelList localTravel={data.localTravel} />
    </Container>
  );
}
