import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button } from '@mui/material';

const API_URL = 'http://localhost:4000';

export default function HotelBrowser({ onSelect }) {
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/hotels`).then(res => res.json()).then(setHotels);
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Available Hotels</Typography>
      <Paper>
        <List>
          {hotels.map(hotel => (
            <ListItem key={hotel.hotelId} secondaryAction={
              onSelect ? (
                <Button variant="outlined" size="small" onClick={() => onSelect(hotel)}>
                  Book This Hotel
                </Button>
              ) : null
            }>
              <ListItemText
                primary={`Hotel #${hotel.hotelId}: ${hotel.name}`}
                secondary={`Location: ${hotel.location} | Rooms: ${hotel.availableRooms}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
