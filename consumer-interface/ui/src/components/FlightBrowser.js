import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button } from '@mui/material';

const API_URL = 'http://localhost:4000';

export default function FlightBrowser({ onSelect }) {
  const [flights, setFlights] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/flights`).then(res => res.json()).then(setFlights);
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Available Flights</Typography>
      <Paper>
        <List>
          {flights.map(flight => (
            <ListItem key={flight.flightId} secondaryAction={
              onSelect ? (
                <Button variant="outlined" size="small" onClick={() => onSelect(flight)}>
                  Book This Flight
                </Button>
              ) : null
            }>
              <ListItemText
                primary={`Flight #${flight.flightId}: ${flight.from} → ${flight.to}`}
                secondary={`Date: ${flight.date} | Seats: ${flight.availableSeats}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
