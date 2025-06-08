import React from 'react';
import formatIDR from '../../utils/formatIDR';
import Pagination from '../common/Pagination';
import './LocalTravelList.css';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Button,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_LOCAL_TRAVEL } from '../../services/graphqlQueries';


export default function LocalTravelList() {
  const initialFilters = {
    province: '',
    city: '',
    district: '',
    type: '',
    min_price: '',
    max_price: '',
    has_ac: false,
    has_wifi: false,
    service_category: '',
    sort_by: 'name',
    sort_order: 'ASC',
  };

  const [filters, setFilters] = React.useState(initialFilters);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(10);

  // Apollo Client query for local travel
  const { data, loading, error, refetch } = useQuery(GET_LOCAL_TRAVEL, {
    variables: {
      page: currentPage,
      limit: itemsPerPage,
      filters: {
        ...filters,
        min_price: filters.min_price ? parseInt(filters.min_price) : undefined,
        max_price: filters.max_price ? parseInt(filters.max_price) : undefined
      }
    },
    fetchPolicy: 'cache-and-network'
  });

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    refetch({ page });
  };

  const localTravelData = data?.localTravel || [];
  const pagination = data?.localTravel?.pagination || { current_page: currentPage, total_pages: 1 };

  // Helper: sort change
  const handleSortChange = (sortBy) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      sort_by: sortBy,
      sort_order: prevFilters.sort_by === sortBy && prevFilters.sort_order === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  // Helper: format price
  const formatPrice = (price) => formatIDR(price);

  // Helper: travel type icon
  const getTravelTypeIcon = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'taxi': return '🚕';
      case 'ojek': return '🛵';
      case 'angkot': return '🚐';
      case 'bus': return '🚌';
      case 'becak': return '🛺';
      case 'rental car': return '🚗';
      default: return '🚗';
    }
  };

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
        <Typography>{error.message || 'Failed to fetch local travel options.'}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Filter Form and Table rendering goes here, matching your existing Material-UI layout */}
      {/* ... */}
      <TableContainer component={Paper} elevation={2}>
        <Table size="small" aria-label="Daftar Travel Lokal">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipe</TableCell>
              <TableCell 
                sx={{ color: 'white', fontWeight: 'bold', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                onClick={() => handleSortChange('name')}
              >
                Nama Travel
                {filters.sort_by === 'name' && (
                  <span> {filters.sort_order === 'ASC' ? '↑' : '↓'}</span>
                )}
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Asal</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tujuan</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Model Kendaraan</TableCell>
              <TableCell 
                sx={{ color: 'white', fontWeight: 'bold', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                onClick={() => handleSortChange('price')}
              >
                Harga
                {filters.sort_by === 'price' && (
                  <span> {filters.sort_order === 'ASC' ? '↑' : '↓'}</span>
                )}
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {localTravelData.length > 0 ? (
              localTravelData.map((item, idx) => (
                <TableRow
                  key={item.id}
                  sx={{
                    backgroundColor: idx % 2 === 0 ? 'background.paper' : 'grey.50',
                    '&:hover': { backgroundColor: 'action.hover' },
                  }}
                >
                  <TableCell>
                    <Box fontSize="1.5rem">
                      {getTravelTypeIcon(item.type)}
                    </Box>
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.origin}</TableCell>
                  <TableCell>{item.destination}</TableCell>
                  <TableCell>{item.vehicle_model}</TableCell>
                  <TableCell>{formatPrice(item.price)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      size="small"
                      color="primary"
                      onClick={() => {/* Handle booking */}}
                    >
                      Pesan
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">
                    Tidak ada data transportasi yang tersedia
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <Box mt={4} display="flex" justifyContent="center">
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.total_pages}
            onPageChange={handlePageChange}
          />
        </Box>
      )}
    </Box>
  );
}
