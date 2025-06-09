import React, { useState } from 'react';
import formatIDR from '../../utils/formatIDR';
import { useHotels } from '../../services/graphqlHotelHooks';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardMedia, 
  Chip, 
  CircularProgress, 
  FormControl, 
  Grid, 
  InputLabel, 
  MenuItem, 
  Paper, 
  Select, 
  TextField, 
  Typography,
  Rating
} from '@mui/material';
import { Search, Clear, Wifi, Pool, LocalParking, Restaurant, AcUnit, FreeBreakfast } from '@mui/icons-material';
import Pagination from '../common/Pagination';
import './HotelList.css';

export default function HotelList() {
  const ACCOMMODATION_TYPES = [
    'Hotel', 'Villa', 'Resort', 'Homestay', 'Guest House', 'Apartemen', 
    'Cottage', 'Bungalow', 'Penginapan', 'Losmen', 'Wisma'
  ];
  
  // UI filter state uses short names; map to GraphQL variable names
  const initialFilters = {
    name: '',
    city: '',
    province: '',
    country: '',
    property_type: '',
    min_star_rating: '',
    max_star_rating: '',
    min_price_per_night: '',
    max_price_per_night: '',
    amenities_include_any: [],
    amenities_include_all: [],
    is_pet_friendly: '',
    min_room_size_sqm: '',
    sort_by: '',
    sort_order: '',
  };

  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Prepare variables for the useHotels hook, matching backend expectations
  const filterVars = {
    name: filters.name || undefined,
    city: filters.city || undefined,
    province: filters.province || undefined,
    country: filters.country || undefined,
    property_type: filters.property_type || undefined,
    min_star_rating: filters.min_star_rating ? parseInt(filters.min_star_rating) : undefined,
    max_star_rating: filters.max_star_rating ? parseInt(filters.max_star_rating) : undefined,
    amenities_include: filters.amenities_include_any && filters.amenities_include_any.length > 0 ? filters.amenities_include_any : undefined,
    is_pet_friendly: filters.is_pet_friendly === '' ? undefined : Boolean(filters.is_pet_friendly),
  };
  const sortVars = {
    sortBy: filters.sort_by || undefined,
    sortOrder: filters.sort_order || undefined,
  };
  // Remove undefined sort keys
  Object.keys(sortVars).forEach(key => sortVars[key] === undefined && delete sortVars[key]);
  const paginationVars = {
    page: currentPage,
    limit: itemsPerPage,
  };
  const queryFilters = {
    filters: filterVars,
    sort: Object.keys(sortVars).length ? sortVars : undefined,
    pagination: paginationVars,
  };

  const { data, loading, error } = useHotels(queryFilters);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle filter submit
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    // Data should refetch automatically due to queryFilters changing via currentPage
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Data should refetch automatically due to queryFilters changing via currentPage
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
    // Data should refetch automatically due to queryFilters changing
  };

  const hotels = data?.filterHotels?.hotels || [];
  const paginationInfo = data?.filterHotels?.pagination;
  // Use backend pagination if available, otherwise provide sensible defaults
  const currentPagination = paginationInfo || { current_page: currentPage, total_pages: 1, total_items: hotels.length };


  // Render loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box color="error.main" p={2}>
        <Typography>{error.message || 'Gagal memuat data hotel.'}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Filter Form */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }} elevation={2}>
        <form onSubmit={handleFilterSubmit}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Nama Hotel"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                size="small"
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipe Akomodasi</InputLabel>
                <Select
                  name="accommodation_type"
                  value={filters.accommodation_type}
                  onChange={handleFilterChange}
                  label="Tipe Akomodasi"
                >
                  <MenuItem value="">Semua Tipe</MenuItem>
                  {ACCOMMODATION_TYPES.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Kota"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                size="small"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Box display="flex" gap={1}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  startIcon={<Search />}
                  fullWidth
                >
                  Cari
                </Button>
                
                <Button 
                  variant="outlined" 
                  onClick={handleResetFilters}
                  startIcon={<Clear />}
                >
                  Reset
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Hotels List */}
      <Grid container spacing={3}>
        {hotels.length > 0 ? (
          hotels.map((hotel) => (
            <Grid item xs={12} key={hotel.id}>
              <Card sx={{ display: 'flex', height: 200, overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  sx={{ width: 300, objectFit: 'cover' }}
                  image={hotel.image_url || '/hotel-placeholder.jpg'}
                  alt={hotel.name}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <CardContent sx={{ flex: '1 0 auto' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography component="div" variant="h6">
                          {hotel.name}
                        </Typography>
                        <Box display="flex" alignItems="center" mt={0.5} mb={1}>
                          <Rating value={hotel.star_rating || 0} precision={0.5} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary" ml={1}>
                            {hotel.star_rating || 'Belum ada rating'}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {[hotel.city, hotel.province].filter(Boolean).join(', ')}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="h6" color="primary">
                          {formatIDR(hotel.price_per_night)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          per malam
                        </Typography>
                      </Box>
                    </Box>
                    <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                      {hotel.has_wifi && <Chip icon={<Wifi />} label="WiFi" size="small" />}
                      {hotel.has_pool && <Chip icon={<Pool />} label="Kolam Renang" size="small" />}
                      {hotel.has_parking && <Chip icon={<LocalParking />} label="Parkir" size="small" />}
                      {hotel.has_restaurant && <Chip icon={<Restaurant />} label="Restoran" size="small" />}
                      {hotel.has_ac && <Chip icon={<AcUnit />} label="AC" size="small" />}
                      {hotel.has_breakfast && <Chip icon={<FreeBreakfast />} label="Sarapan" size="small" />}
                    </Box>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0, textAlign: 'right' }}>
                    <Button variant="contained" size="small">
                      Pesan Sekarang
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                Tidak ada hotel yang ditemukan
              </Typography>
              <Button variant="outlined" onClick={handleResetFilters} sx={{ mt: 2 }}>
                Reset Filter
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Pagination */}
      {currentPagination && currentPagination.total_pages > 1 && (
        <Box mt={4} display="flex" justifyContent="center">
          <Pagination
            count={currentPagination.total_pages} // MUI uses 'count' for total pages
            page={currentPagination.current_page}  // MUI uses 'page' for current page
            onChange={handlePageChange} // MUI Pagination's default onChange prop
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
