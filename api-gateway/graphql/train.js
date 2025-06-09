// GraphQL schema and resolvers for Train Service
const { gql } = require('apollo-server-express');
const fetch = require('node-fetch');

const typeDefs = gql`
  type Train {
    id: ID!
    train_number: String
    origin_station_name: String # Matching frontend expectation
    destination_station_name: String # Matching frontend expectation
    origin_city: String
    destination_city: String
    origin_province: String
    destination_province: String
    departure_time: String
    arrival_time: String
    price: Float
    seats_available: Int
    train_class: String
    subclass: String
    train_type: String
    operator: String
    duration: Int # Assuming duration is in minutes or a common unit
    # Add other fields as needed by UI and provided by service
  }

  input TrainFiltersInput {
    origin_station_code: String
    destination_station_code: String
    origin_city: String
    destination_city: String
    origin_province: String
    destination_province: String
    train_class: String
    subclass: String
    train_type: String
    operator: String
    min_duration: Int
    max_duration: Int
    price_category: String
    min_price: Float
    max_price: Float
    departure_date: String # Consider GraphQL Date scalar
  }

  enum SortOrder {
    ASC
    DESC
  }

  input TrainSortInput {
    sortBy: String # e.g., "price", "departure_time"
    sortOrder: SortOrder
  }

  input PaginationInput {
    page: Int
    limit: Int
  }

  type PaginationInfo {
    totalItems: Int
    totalPages: Int
    currentPage: Int
    pageSize: Int
    hasNextPage: Boolean
    hasPrevPage: Boolean
  }

  type TrainsPage {
    trains: [Train!]!
    pagination: PaginationInfo
  }

  type Query {
    # Existing queries
    trains(origin: String, destination: String, date: String): [Train]
    train(id: ID!): Train

    # Search trains query
    searchTrains(origin: String, destination: String, date: String): [Train]

    # Pricing query for a specific train
    trainPricing(id: ID!, date: String): Pricing

    # New filter query
    filterTrains(
      filters: TrainFiltersInput
      sort: TrainSortInput
      pagination: PaginationInput
    ): TrainsPage
  }

  type Mutation {
    createTrain(train_number: String!, origin: String!, destination: String!, departure_time: String!, arrival_time: String!, price: Float!, seats_available: Int!): Train
    # Add other mutations as needed
  }

  type Pricing {
    seatClass: String
    price: Float
    currency: String
    date: String
  }
`;

const TRAIN_SERVICE_URL = 'http://localhost:3007/api/trains';

const resolvers = {
  Query: {
    // Explicit resolver for /search endpoint
    async searchTrains(_, { origin, destination, date }) {
      const queryParams = new URLSearchParams();
      if (origin) queryParams.append('origin', origin);
      if (destination) queryParams.append('destination', destination);
      if (date) queryParams.append('date', date);
      const url = `${TRAIN_SERVICE_URL}/search?${queryParams.toString()}`;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorBody = await res.text();
          console.error(`Train service request failed (searchTrains) with status ${res.status}: ${errorBody}`);
          throw new Error(`Failed to fetch searched trains from service. Status: ${res.status}`);
        }
        const serviceResponse = await res.json();
        if (serviceResponse.status !== 'success' || !serviceResponse.data) {
          return [];
        }
        // Map train data to GraphQL Train type
        return Array.isArray(serviceResponse.data)
          ? serviceResponse.data.map(train => ({
              id: train.id,
              train_number: train.train_number || train.train_no || null,
              origin_station_name: train.origin_station_name || train.origin_station_code || train.origin || null,
              destination_station_name: train.destination_station_name || train.destination_station_code || train.destination || null,
              origin_city: train.origin_city || null,
              destination_city: train.destination_city || null,
              departure_time: train.departure_time || null,
              arrival_time: train.arrival_time || null,
              price: train.price !== undefined ? parseFloat(train.price) : null,
              seats_available: train.seats_available !== undefined ? parseInt(train.seats_available, 10) : null,
              train_class: train.train_class || null,
              subclass: train.subclass || null,
              train_type: train.train_type || null,
              operator: train.operator || null,
              duration: train.duration !== undefined ? parseInt(train.duration, 10) : null,
            }))
          : [];
      } catch (error) {
        // TODO: Add monitoring/logging for searchTrains errors
        throw new Error('An error occurred while fetching searched trains: ' + error.message);
      }
    },
    // Explicit resolver for /:id/pricing endpoint
    async trainPricing(_, { id, date }) {
      const queryParams = new URLSearchParams();
      if (date) queryParams.append('date', date);
      const url = `${TRAIN_SERVICE_URL}/${id}/pricing?${queryParams.toString()}`;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorBody = await res.text();
          console.error(`Train service request failed (trainPricing) with status ${res.status}: ${errorBody}`);
          throw new Error(`Failed to fetch train pricing from service. Status: ${res.status}`);
        }
        const serviceResponse = await res.json();
        if (serviceResponse.status !== 'success' || !serviceResponse.data) {
          return [];
        }
        // Map pricing data to a suitable GraphQL type (adjust as needed)
        return Array.isArray(serviceResponse.data)
          ? serviceResponse.data.map(price => ({
              seatClass: price.seat_class || null,
              price: price.price,
              currency: price.currency || 'IDR',
              date: price.date || null,
            }))
          : [];
      } catch (error) {
        // TODO: Add monitoring/logging for trainPricing errors
        throw new Error('An error occurred while fetching train pricing: ' + error.message);
      }
    },
    async trains(_, args) {
      let url = `${TRAIN_SERVICE_URL}?`;
      Object.entries(args).forEach(([key, value]) => {
        if (value !== undefined && value !== null) url += `${key}=${encodeURIComponent(value)}&`;
      });
      const res = await fetch(url);
      const data = await res.json();
      const trainsData = Array.isArray(data.data) ? data.data : (data.data && Array.isArray(data.data.trains) ? data.data.trains : []);
      if (data.status !== 'success') return [];
      return trainsData.map(train => ({
        id: train.id,
        train_number: train.train_number || train.train_no || null,
        origin: train.origin || train.origin_city || null,
        destination: train.destination || train.destination_city || null,
        departure_time: train.departure_time || null,
        arrival_time: train.arrival_time || null,
        price: train.price || null,
        seats_available: train.seats_available || null,
      }));
    },
    async train(_, { id }) {
      const res = await fetch(`${TRAIN_SERVICE_URL}/${id}`);
      const data = await res.json();
      if (data.status !== 'success' || !data.data) return null;
      const train = data.data;
      return {
        id: train.id,
        train_number: train.train_number || train.train_no || null,
        origin_station_name: train.origin_station_name || train.origin_station_code || train.origin || null,
        destination_station_name: train.destination_station_name || train.destination_station_code || train.destination || null,
        origin_city: train.origin_city || null,
        destination_city: train.destination_city || null,
        origin_province: train.origin_province || null,
        destination_province: train.destination_province || null,
        departure_time: train.departure_time || null,
        arrival_time: train.arrival_time || null,
        price: train.price !== undefined ? parseFloat(train.price) : null,
        seats_available: train.seats_available !== undefined ? parseInt(train.seats_available, 10) : null,
        train_class: train.train_class || null,
        subclass: train.subclass || null,
        train_type: train.train_type || null,
        operator: train.operator || null,
        duration: train.duration !== undefined ? parseInt(train.duration, 10) : null,
      };
    },
    async filterTrains(_, { filters, sort, pagination }) {
      const TRAIN_FILTER_URL = `${TRAIN_SERVICE_URL}/filter`;
      const queryParams = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && String(value).trim() !== '') {
            queryParams.append(key, value);
          }
        });
      }

      if (sort) {
        if (sort.sortBy) queryParams.append('sort_by', sort.sortBy);
        if (sort.sortOrder) queryParams.append('sort_order', sort.sortOrder);
      }

      if (pagination) {
        if (pagination.page) queryParams.append('page', pagination.page);
        if (pagination.limit) queryParams.append('limit', pagination.limit);
      }

      const url = `${TRAIN_FILTER_URL}?${queryParams.toString()}`;
      console.log(`Fetching trains from: ${url}`); // For debugging

      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorBody = await res.text();
          console.error(`Train service request failed with status ${res.status}: ${errorBody}`);
          throw new Error(`Failed to fetch trains from service. Status: ${res.status}`);
        }
        const serviceResponse = await res.json();

        if (serviceResponse.status !== 'success' || !serviceResponse.data) {
          console.warn('Train service did not return success or data:', serviceResponse);
          return { trains: [], pagination: null };
        }

        const mappedTrains = serviceResponse.data.map(train => ({
          id: train.id,
          train_number: train.train_number || train.train_no || null,
          origin_station_name: train.origin_station_name || train.origin_station_code || train.origin || null,
          destination_station_name: train.destination_station_name || train.destination_station_code || train.destination || null,
          origin_city: train.origin_city || null,
          destination_city: train.destination_city || null,
          origin_province: train.origin_province || null,
          destination_province: train.destination_province || null,
          departure_time: train.departure_time || null,
          arrival_time: train.arrival_time || null,
          price: train.price !== undefined ? parseFloat(train.price) : null,
          seats_available: train.seats_available !== undefined ? parseInt(train.seats_available, 10) : null,
          train_class: train.train_class || null,
          subclass: train.subclass || null,
          train_type: train.train_type || null,
          operator: train.operator || null,
          duration: train.duration !== undefined ? parseInt(train.duration, 10) : null,
        }));

        const servicePagination = serviceResponse.pagination || {};
        const currentPage = parseInt(servicePagination.current_page || servicePagination.page, 10) || 1;
        const totalPages = parseInt(servicePagination.total_pages || servicePagination.pages, 10) || 0;

        const mappedPagination = {
          totalItems: parseInt(servicePagination.total_items || servicePagination.total, 10) || 0,
          totalPages: totalPages,
          currentPage: currentPage,
          pageSize: parseInt(servicePagination.per_page || servicePagination.limit, 10) || 0,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
        };

        return {
          trains: mappedTrains,
          pagination: mappedPagination,
        };
      } catch (error) {
        console.error('Error in filterTrains resolver:', error);
        throw new Error('An error occurred while fetching trains.');
      }
    },
    async train(_, { id }) {
      const res = await fetch(`${TRAIN_SERVICE_URL}/${id}`);
      const data = await res.json();
      if (data.status !== 'success') return null;
      const train = data.data;
      if (!train) return null; // Ensure train data exists before mapping
      return {
        id: train.id,
        train_number: train.train_number || train.train_no || null,
        origin: train.origin || train.origin_city || null,
        destination: train.destination || train.destination_city || null,
        departure_time: train.departure_time || null,
        arrival_time: train.arrival_time || null,
        price: train.price || null,
        seats_available: train.seats_available || null,
      };
    }
  },
  Mutation: {
    async createTrain(_, { train_number, origin, destination, departure_time, arrival_time, price, seats_available }) {
      if (!train_number || !origin || !destination || !departure_time || !arrival_time || !price || !seats_available) {
        throw new Error('All fields are required');
      }
      try {
        const res = await fetch(TRAIN_SERVICE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ train_number, origin, destination, departure_time, arrival_time, price, seats_available })
        });
        const data = await res.json();
        if (data.status !== 'success') throw new Error(data.message || 'Failed to create train');
        return data.data;
      } catch (err) {
        throw new Error('Train creation failed: ' + err.message);
      }
    }
  }
};

module.exports = { typeDefs, resolvers };
