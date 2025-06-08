import React, { useState } from 'react';
import formatIDR from '../../utils/formatIDR';
import { useQuery } from '@apollo/client';
import { GET_TRAINS } from '../../services/graphqlQueries';
import Pagination from '../common/Pagination';
import './TrainList.css';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Typography, CircularProgress } from '@mui/material';

// Sample data for dropdowns
const provinces = [
  'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'DI Yogyakarta', 'Banten', 'Sumatera Utara', 'Sumatera Barat', 'Sumatera Selatan', 'Riau', 'Lampung', 'Bali', 'Kalimantan Timur', 'Sulawesi Selatan', 'Papua'
];

const priceCategories = [
  'Ekonomi', 'Bisnis', 'Eksekutif', 'Premium', 'VIP'
];

const trainClasses = [
  { class: 'Ekonomi', subclasses: ['A', 'B', 'C'] },
  { class: 'Bisnis', subclasses: ['D', 'E'] },
  { class: 'Eksekutif', subclasses: ['F', 'G'] },
  { class: 'Premium', subclasses: ['H'] },
  { class: 'VIP', subclasses: ['I'] }
];

const trainTypes = [
  'Reguler', 'Argo', 'Komuter', 'Lokal', 'Sleeper'
];

export default function TrainList() {
  const initialFilters = {
    origin_province: '',
    destination_province: '',
    departure_date: '',
    min_price: '',
    max_price: '',
    train_type: '',
    subclass: '',
    price_category: '',
    sort_by: 'departure_time',
    sort_order: 'ASC'
  };

  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Apollo Client query for trains
  const { data, loading, error, refetch } = useQuery(GET_TRAINS, {
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

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
  };

  // Handle filter submit
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    refetch({ page });
  };

  const trains = data?.trains || [];
  const pagination = data?.trains?.pagination || { current_page: currentPage, total_pages: 1 };

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
        <Typography>{error.message || 'Failed to fetch trains.'}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <form onSubmit={handleFilterSubmit} className="filter-form">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="origin_province">Provinsi Asal:</label>
            <select
              id="origin_province"
              name="origin_province"
              value={filters.origin_province}
              onChange={handleFilterChange}
            >
              <option value="">Semua Provinsi</option>
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="destination_province">Provinsi Tujuan:</label>
            <select
              id="destination_province"
              name="destination_province"
              value={filters.destination_province}
              onChange={handleFilterChange}
            >
              <option value="">Semua Provinsi</option>
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="departure_date">Tanggal Keberangkatan:</label>
            <input
              type="date"
              id="departure_date"
              name="departure_date"
              value={filters.departure_date}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="origin_city">Kota Asal:</label>
            <input
              type="text"
              id="origin_city"
              name="origin_city"
              value={filters.origin_city}
              onChange={handleFilterChange}
              placeholder="Jakarta"
            />
          </div>
          <div className="filter-group">
            <label htmlFor="destination_city">Kota Tujuan:</label>
            <input
              type="text"
              id="destination_city"
              name="destination_city"
              value={filters.destination_city}
              onChange={handleFilterChange}
              placeholder="Bandung"
            />
          </div>
          <div className="filter-group">
            <label htmlFor="price_category">Kategori Harga:</label>
            <select
              id="price_category"
              name="price_category"
              value={filters.price_category}
              onChange={handleFilterChange}
            >
              <option value="">Semua Kategori</option>
              {priceCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="train_class">Kelas Kereta:</label>
            <select
              id="train_class"
              name="train_class"
              value={filters.train_class}
              onChange={(e) => {
                const selectedClass = e.target.value;
                handleFilterChange(e);
                setFilters(prev => ({ ...prev, subclass: '' }));
              }}
            >
              <option value="">Semua</option>
              {trainClasses.map(tc => (
                <option key={tc.class} value={tc.class}>{tc.class}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="subclass">Subkelas:</label>
            <select
              id="subclass"
              name="subclass"
              value={filters.subclass}
              onChange={handleFilterChange}
              disabled={!filters.train_class}
            >
              <option value="">Semua</option>
              {filters.train_class && trainClasses
                .find(tc => tc.class === filters.train_class)?.subclasses
                .map(subclass => (
                  <option key={subclass} value={subclass}>{subclass}</option>
                ))
              }
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="train_type">Tipe Kereta:</label>
            <select
              id="train_type"
              name="train_type"
              value={filters.train_type}
              onChange={handleFilterChange}
            >
              <option value="">Semua</option>
              {trainTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="operator">Operator:</label>
            <input
              type="text"
              id="operator"
              name="operator"
              value={filters.operator}
              onChange={handleFilterChange}
              placeholder="KAI"
            />
          </div>
        </div>
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="min_price">Harga Minimum (IDR):</label>
            <input
              type="number"
              id="min_price"
              name="min_price"
              value={filters.min_price}
              onChange={handleFilterChange}
              placeholder="50000"
            />
          </div>
          <div className="filter-group">
            <label htmlFor="max_price">Harga Maksimum (IDR):</label>
            <input
              type="number"
              id="max_price"
              name="max_price"
              value={filters.max_price}
              onChange={handleFilterChange}
              placeholder="500000"
            />
          </div>
        </div>
        <div className="filter-actions">
          <button type="submit" className="btn-primary">Cari Kereta</button>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => {
              setFilters({
                origin_city: '',
                destination_city: '',
                origin_province: '',
                destination_province: '',
                origin_station: '',
                destination_station: '',
                train_class: '',
                subclass: '',
                train_type: '',
                operator: '',
                departure_date: '',
                min_price: '',
                max_price: '',
                price_category: '',
                sort_by: 'departure_time',
                sort_order: 'ASC'
              });
            }}
          >
            Reset Filter
          </button>
        </div>
      </form>
      <TableContainer component={Paper} elevation={2} sx={{ mt: 4 }}>
        <Table size="small" aria-label="Daftar Kereta Api">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nama Kereta</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Asal</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tujuan</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tanggal</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Harga</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trains.length > 0 ? (
              trains.map((item, idx) => (
                <TableRow key={item.id} sx={{ backgroundColor: idx % 2 === 0 ? 'background.paper' : 'grey.50' }}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.origin}</TableCell>
                  <TableCell>{item.destination}</TableCell>
                  <TableCell>{item.departure_date}</TableCell>
                  <TableCell>{formatIDR(item.price)}</TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small" color="primary">Pesan</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">Tidak ada data kereta yang tersedia</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {pagination && pagination.total_pages > 1 && (
        <Box mt={3} display="flex" justifyContent="center">
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.total_pages}
            onPageChange={handlePageChange}
          />
        </Box>
      )}
    </Box>
  );}
