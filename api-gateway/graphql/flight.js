// GraphQL schema and resolvers for Flight Service
const { gql } = require('apollo-server-express');
const fetch = require('node-fetch');

const typeDefs = gql`
  type Flight {
    id: ID!
    airline: String
    flight_number: String
    origin: String
    destination: String
    departure_time: String
    arrival_time: String
    price: Float
    seats_available: Int
    # Add other fields like flight_class if UI needs them and service provides them
  }

  input FlightFiltersInput {
    origin_city: String
    destination_city: String
    origin_code: String
    destination_code: String
    airline_code: String
    airline_name: String
    flight_class: String
    departure_date: String # Consider GraphQL Date scalar if available/used elsewhere
    min_price: Float
    max_price: Float
  }

  enum SortOrder {
    ASC
    DESC
  }

  input FlightSortInput {
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

  type FlightsPage {
    flights: [Flight!]!
    pagination: PaginationInfo
  }

  type Query {
    # Existing queries
    flights(origin: String, destination: String, date: String): [Flight]
    flight(id: ID!): Flight

    # Search flights query
    searchFlights(origin: String, destination: String, date: String): [Flight]

    # Pricing query for a specific flight
    flightPricing(id: ID!, date: String): Pricing

    # New filter query
    filterFlights(
      filters: FlightFiltersInput
      sort: FlightSortInput
      pagination: PaginationInput
    ): FlightsPage
  }

  type Mutation {
    createFlight(airline: String!, flight_number: String!, origin: String!, destination: String!, departure_time: String!, arrival_time: String!, price: Float!, seats_available: Int!): Flight
    # Add other mutations as needed
  }

  type Pricing {
    seatClass: String
    price: Float
    currency: String
    date: String
  }
`;

const FLIGHT_SERVICE_URL = 'http://localhost:3002/api/flights';

const resolvers = {
  Query: {
    // Explicit resolver for /search endpoint
    async searchFlights(_, { origin, destination, date }) {
      const queryParams = new URLSearchParams();
      if (origin) queryParams.append('origin', origin);
      if (destination) queryParams.append('destination', destination);
      if (date) queryParams.append('date', date);
      const url = `${FLIGHT_SERVICE_URL}/search?${queryParams.toString()}`;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorBody = await res.text();
          console.error(`Flight service request failed (searchFlights) with status ${res.status}: ${errorBody}`);
          throw new Error(`Failed to fetch searched flights from service. Status: ${res.status}`);
        }
        const serviceResponse = await res.json();
        if (serviceResponse.status !== 'success' || !serviceResponse.data) {
          return [];
        }
        // Map flight data to GraphQL Flight type
        return Array.isArray(serviceResponse.data)
          ? serviceResponse.data.map(flight => ({
              id: flight.id,
              airline: flight.airline || null,
              flight_number: flight.flight_number || flight.flight_no || null,
              origin: flight.origin || flight.origin_city || null,
              destination: flight.destination || flight.destination_city || null,
              departure_time: flight.departure_time || null,
              arrival_time: flight.arrival_time || null,
              price: flight.price !== undefined ? parseFloat(flight.price) : null,
              seats_available: flight.seats_available !== undefined ? parseInt(flight.seats_available, 10) : null,
            }))
          : [];
      } catch (error) {
        // TODO: Add monitoring/logging for searchFlights errors
        throw new Error('An error occurred while fetching searched flights: ' + error.message);
      }
    },
    // Explicit resolver for /:id/pricing endpoint
    async flightPricing(_, { id, date }) {
      const queryParams = new URLSearchParams();
      if (date) queryParams.append('date', date);
      const url = `${FLIGHT_SERVICE_URL}/${id}/pricing?${queryParams.toString()}`;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorBody = await res.text();
          console.error(`Flight service request failed (flightPricing) with status ${res.status}: ${errorBody}`);
          throw new Error(`Failed to fetch flight pricing from service. Status: ${res.status}`);
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
        // TODO: Add monitoring/logging for flightPricing errors
        throw new Error('An error occurred while fetching flight pricing: ' + error.message);
      }
    },
    async flights(_, args) {
      let url = FLIGHT_SERVICE_URL;
      // If any filter params are provided, build a query string
      const params = [];
      if (args.origin) params.push(`origin=${encodeURIComponent(args.origin)}`);
      if (args.destination) params.push(`destination=${encodeURIComponent(args.destination)}`);
      if (args.date) params.push(`date=${encodeURIComponent(args.date)}`);
      if (params.length > 0) {
        // Use /filter endpoint if available, otherwise append as query params
        url += '/filter?' + params.join('&');
      }
      const res = await fetch(url);
      const data = await res.json();
      // Check if the primary data field is an array, common for list endpoints
      const flightsData = Array.isArray(data.data) ? data.data : (data.data && Array.isArray(data.data.flights) ? data.data.flights : []);
      if (data.status !== 'success') return [];
      return flightsData.map(flight => ({
        id: flight.id,
        airline: flight.airline || null,
        flight_number: flight.flight_number || flight.flight_no || null,
        origin: flight.origin || flight.origin_city || null,
        destination: flight.destination || flight.destination_city || null,
        departure_time: flight.departure_time || null,
        arrival_time: flight.arrival_time || null,
        price: flight.price || null,
        seats_available: flight.seats_available || null,
      }));
    },
    async flight(_, { id }) {
      const res = await fetch(`${FLIGHT_SERVICE_URL}/${id}`);
      const data = await res.json();
      if (data.status !== 'success' || !data.data) return null;
      const flight = data.data;
      return {
        id: flight.id,
        airline: flight.airline_name || flight.airline_code || flight.airline || null,
        flight_number: flight.flight_number || flight.flight_no || null,
        origin: flight.origin_city || flight.origin_code || flight.origin || null,
        destination: flight.destination_city || flight.destination_code || flight.destination || null,
        departure_time: flight.departure_time || null,
        arrival_time: flight.arrival_time || null,
        price: flight.price || null,
        seats_available: flight.seats_available || null,
      };
    },
    async filterFlights(_, { filters, sort, pagination }) {
      const FLIGHT_FILTER_URL = `${FLIGHT_SERVICE_URL}/filter`;
      const queryParams = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && String(value).trim() !== '') {
            // Map GraphQL filter names to service API query param names if they differ
            // For now, assuming they are the same as defined in FlightFiltersInput
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

      const url = `${FLIGHT_FILTER_URL}?${queryParams.toString()}`;
      console.log(`Fetching flights from: ${url}`); // For debugging

      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorBody = await res.text();
          console.error(`Flight service request failed with status ${res.status}: ${errorBody}`);
          throw new Error(`Failed to fetch flights from service. Status: ${res.status}`);
        }
        const serviceResponse = await res.json();

        if (serviceResponse.status !== 'success' || !serviceResponse.data) {
          console.warn('Flight service did not return success or data:', serviceResponse);
          return { flights: [], pagination: null };
        }

        const mappedFlights = serviceResponse.data.map(flight => ({
          id: flight.id,
          airline: flight.airline_name || flight.airline_code || flight.airline || null,
          flight_number: flight.flight_number || flight.flight_no || null,
          origin: flight.origin_city || flight.origin_code || flight.origin || null,
          destination: flight.destination_city || flight.destination_code || flight.destination || null,
          departure_time: flight.departure_time || null,
          arrival_time: flight.arrival_time || null,
          price: flight.price !== undefined ? parseFloat(flight.price) : null,
          seats_available: flight.seats_available !== undefined && flight.seats_available !== null ? parseInt(flight.seats_available, 10) : null,
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
          flights: mappedFlights,
          pagination: mappedPagination,
        };
      } catch (error) {
        console.error('Error in filterFlights resolver:', error);
        // Depending on policy, you might want to throw the error or return a structured error response
        throw new Error('An error occurred while fetching flights.');
      }
    },
    async flight(_, { id }) {
      const res = await fetch(`${FLIGHT_SERVICE_URL}/${id}`);
      const data = await res.json();
      if (data.status !== 'success') return null;
      const flight = data.data;
      if (!flight) return null; // Ensure flight data exists before mapping
      return {
        id: flight.id,
        airline: flight.airline || null,
        flight_number: flight.flight_number || flight.flight_no || null,
        origin: flight.origin || flight.origin_city || null,
        destination: flight.destination || flight.destination_city || null,
        departure_time: flight.departure_time || null,
        arrival_time: flight.arrival_time || null,
        price: flight.price || null,
        seats_available: flight.seats_available || null,
      };
    }
  },
  Mutation: {
    async createFlight(_, { airline, flight_number, origin, destination, departure_time, arrival_time, price, seats_available }) {
      if (!airline || !flight_number || !origin || !destination || !departure_time || !arrival_time || !price || !seats_available) {
        throw new Error('All fields are required');
      }
      try {
        const res = await fetch(FLIGHT_SERVICE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ airline, flight_number, origin, destination, departure_time, arrival_time, price, seats_available })
        });
        const data = await res.json();
        if (data.status !== 'success') throw new Error(data.message || 'Failed to create flight');
        return data.data;
      } catch (err) {
        throw new Error('Flight creation failed: ' + err.message);
      }
    }
  }
};

module.exports = { typeDefs, resolvers };
