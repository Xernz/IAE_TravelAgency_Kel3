// GraphQL schema and resolvers for Local Travel Service
const { gql } = require('apollo-server-express');
const fetch = require('node-fetch');

const typeDefs = gql`
  type LocalTravel {
    id: ID!
    name: String # As expected by frontend
    type: String
    provider: String # Could be operator_name or provider from service
    origin: String # Maps to origin_city or similar
    destination: String # Maps to destination_city or similar
    departure_time: String
    arrival_time: String
    price: Float
    seats_available: Int # Or available_units / capacity
    vehicle_model: String # As expected by frontend
    origin_province: String
    destination_province: String
    origin_kabupaten: String
    destination_kabupaten: String
    route: String
    capacity: Int
    class_type: String
    has_ac: Boolean
    has_wifi: Boolean
    # Add other fields as needed
  }

  input LocalTravelFiltersInput {
    origin_city: String
    destination_city: String
    origin_province: String
    destination_province: String
    origin_kabupaten: String
    destination_kabupaten: String
    type: String
    operator_name: String # Maps to 'provider' in LocalTravel type if distinct
    provider: String
    route: String
    min_capacity: Int
    max_capacity: Int
    class_type: String
    has_ac: Boolean
    has_wifi: Boolean
    min_price: Float
    max_price: Float
    date: String # For filtering by specific travel date
  }

  enum SortOrder {
    ASC
    DESC
  }

  input LocalTravelSortInput {
    sortBy: String # e.g., "price", "name"
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

  type LocalTravelsPage {
    localTravels: [LocalTravel!]!
    pagination: PaginationInfo
  }

  type Query {
    # Existing queries
    localTravels(origin: String, destination: String, date: String): [LocalTravel]
    localTravel(id: ID!): LocalTravel

    # Search local travels query
    searchLocalTravels(origin: String, destination: String, date: String): [LocalTravel]

    # Pricing query for a specific local travel
    localTravelPricing(id: ID!, date: String): Pricing

    # New filter query
    filterLocalTravels(
      filters: LocalTravelFiltersInput
      sort: LocalTravelSortInput
      pagination: PaginationInput
    ): LocalTravelsPage
  }

  type Mutation {
    createLocalTravel(type: String!, provider: String!, origin: String!, destination: String!, departure_time: String!, arrival_time: String!, price: Float!, seats_available: Int!): LocalTravel
    # Add other mutations as needed
  }
`;

const LOCAL_TRAVEL_SERVICE_URL = 'http://localhost:3006/api/local-travel';

const resolvers = {
  Query: {
    // Explicit resolver for /search endpoint
    async searchLocalTravels(_, { origin, destination, date }) {
      const queryParams = new URLSearchParams();
      if (origin) queryParams.append('origin', origin);
      if (destination) queryParams.append('destination', destination);
      if (date) queryParams.append('date', date);
      const url = `${LOCAL_TRAVEL_SERVICE_URL}/search?${queryParams.toString()}`;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorBody = await res.text();
          console.error(`Local Travel service request failed (searchLocalTravels) with status ${res.status}: ${errorBody}`);
          throw new Error(`Failed to fetch searched local travels from service. Status: ${res.status}`);
        }
        const serviceResponse = await res.json();
        if (serviceResponse.status !== 'success' || !serviceResponse.data) {
          return [];
        }
        // Map local travel data to GraphQL LocalTravel type
        return Array.isArray(serviceResponse.data)
          ? serviceResponse.data.map(travel => ({
              id: travel.id,
              name: travel.name || travel.provider || travel.operator_name || null,
              type: travel.type || null,
              provider: travel.provider || travel.operator_name || null,
              origin: travel.origin_city || travel.origin_kabupaten || travel.origin_province || travel.origin || null,
              destination: travel.destination_city || travel.destination_kabupaten || travel.destination_province || travel.destination || null,
              departure_time: travel.departure_time || null,
              arrival_time: travel.arrival_time || null,
              price: travel.price !== undefined ? parseFloat(travel.price) : null,
              seats_available: travel.seats_available !== undefined ? parseInt(travel.seats_available, 10) : (travel.capacity !== undefined ? parseInt(travel.capacity, 10) : null),
              vehicle_model: travel.vehicle_model || travel.vehicle_type || null,
              origin_province: travel.origin_province || null,
              destination_province: travel.destination_province || null,
              origin_kabupaten: travel.origin_kabupaten || null,
              destination_kabupaten: travel.destination_kabupaten || null,
              route: travel.route || null,
              capacity: travel.capacity !== undefined ? parseInt(travel.capacity, 10) : null,
              class_type: travel.class_type || null,
              has_ac: travel.has_ac,
              has_wifi: travel.has_wifi,
            }))
          : [];
      } catch (error) {
        // TODO: Add monitoring/logging for searchLocalTravels errors
        throw new Error('An error occurred while fetching searched local travels: ' + error.message);
      }
    },
    // Explicit resolver for /:id/pricing endpoint
    async localTravelPricing(_, { id, date }) {
      const queryParams = new URLSearchParams();
      if (date) queryParams.append('date', date);
      const url = `${LOCAL_TRAVEL_SERVICE_URL}/${id}/pricing?${queryParams.toString()}`;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorBody = await res.text();
          console.error(`Local Travel service request failed (localTravelPricing) with status ${res.status}: ${errorBody}`);
          throw new Error(`Failed to fetch local travel pricing from service. Status: ${res.status}`);
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
        // TODO: Add monitoring/logging for localTravelPricing errors
        throw new Error('An error occurred while fetching local travel pricing: ' + error.message);
      }
    },
    async localTravels(_, args) {
      let url = `${LOCAL_TRAVEL_SERVICE_URL}?`;
      Object.entries(args).forEach(([key, value]) => {
        if (value !== undefined && value !== null) url += `${key}=${encodeURIComponent(value)}&`;
      });
      const res = await fetch(url);
      const data = await res.json();
      const localTravelsData = Array.isArray(data.data) ? data.data : (data.data && Array.isArray(data.data.localTravels) ? data.data.localTravels : []);
      if (data.status !== 'success') return [];
      return localTravelsData.map(travel => ({
        id: travel.id,
        type: travel.type || null,
        provider: travel.provider || null,
        origin: travel.origin || travel.origin_city || null,
        destination: travel.destination || travel.destination_city || null,
        departure_time: travel.departure_time || null,
        arrival_time: travel.arrival_time || null,
        price: travel.price || null,
        seats_available: travel.seats_available || null,
      }));
    },
    async localTravel(_, { id }) {
      const res = await fetch(`${LOCAL_TRAVEL_SERVICE_URL}/${id}`);
      const data = await res.json();
      if (data.status !== 'success' || !data.data) return null;
      const travel = data.data;
      return {
        id: travel.id,
        name: travel.name || travel.provider || travel.operator_name || null, // Prioritize name, fallback to provider/operator
        type: travel.type || null,
        provider: travel.provider || travel.operator_name || null,
        origin: travel.origin_city || travel.origin_kabupaten || travel.origin_province || travel.origin || null,
        destination: travel.destination_city || travel.destination_kabupaten || travel.destination_province || travel.destination || null,
        departure_time: travel.departure_time || null,
        arrival_time: travel.arrival_time || null,
        price: travel.price !== undefined ? parseFloat(travel.price) : null,
        seats_available: travel.seats_available !== undefined ? parseInt(travel.seats_available, 10) : (travel.capacity !== undefined ? parseInt(travel.capacity, 10) : null),
        vehicle_model: travel.vehicle_model || travel.vehicle_type || null,
        origin_province: travel.origin_province || null,
        destination_province: travel.destination_province || null,
        origin_kabupaten: travel.origin_kabupaten || null,
        destination_kabupaten: travel.destination_kabupaten || null,
        route: travel.route || null,
        capacity: travel.capacity !== undefined ? parseInt(travel.capacity, 10) : null,
        class_type: travel.class_type || null,
        has_ac: travel.has_ac,
        has_wifi: travel.has_wifi,
      };
    },
    async filterLocalTravels(_, { filters, sort, pagination }) {
      const LOCAL_TRAVEL_FILTER_URL = `${LOCAL_TRAVEL_SERVICE_URL}/filter`;
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

      const url = `${LOCAL_TRAVEL_FILTER_URL}?${queryParams.toString()}`;
      console.log(`Fetching local travels from: ${url}`); // For debugging

      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorBody = await res.text();
          console.error(`Local Travel service request failed with status ${res.status}: ${errorBody}`);
          throw new Error(`Failed to fetch local travels from service. Status: ${res.status}`);
        }
        const serviceResponse = await res.json();

        if (serviceResponse.status !== 'success' || !serviceResponse.data) {
          console.warn('Local Travel service did not return success or data:', serviceResponse);
          return { localTravels: [], pagination: null };
        }

        const mappedLocalTravels = serviceResponse.data.map(travel => ({
          id: travel.id,
          name: travel.name || travel.provider || travel.operator_name || null, // Prioritize name, fallback to provider/operator
          type: travel.type || null,
          provider: travel.provider || travel.operator_name || null,
          origin: travel.origin_city || travel.origin_kabupaten || travel.origin_province || travel.origin || null,
          destination: travel.destination_city || travel.destination_kabupaten || travel.destination_province || travel.destination || null,
          departure_time: travel.departure_time || null,
          arrival_time: travel.arrival_time || null,
          price: travel.price !== undefined ? parseFloat(travel.price) : null,
          seats_available: travel.seats_available !== undefined ? parseInt(travel.seats_available, 10) : (travel.capacity !== undefined ? parseInt(travel.capacity, 10) : null),
          vehicle_model: travel.vehicle_model || travel.vehicle_type || null,
          origin_province: travel.origin_province || null,
          destination_province: travel.destination_province || null,
          origin_kabupaten: travel.origin_kabupaten || null,
          destination_kabupaten: travel.destination_kabupaten || null,
          route: travel.route || null,
          capacity: travel.capacity !== undefined ? parseInt(travel.capacity, 10) : null,
          class_type: travel.class_type || null,
          has_ac: travel.has_ac,
          has_wifi: travel.has_wifi,
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
          localTravels: mappedLocalTravels,
          pagination: mappedPagination,
        };
      } catch (error) {
        console.error('Error in filterLocalTravels resolver:', error);
        throw new Error('An error occurred while fetching local travels.');
      }
    },
    async localTravel(_, { id }) {
      const res = await fetch(`${LOCAL_TRAVEL_SERVICE_URL}/${id}`);
      const data = await res.json();
      if (data.status !== 'success') return null;
      const travel = data.data;
      if (!travel) return null; // Ensure travel data exists before mapping
      return {
        id: travel.id,
        type: travel.type || null,
        provider: travel.provider || null,
        origin: travel.origin || travel.origin_city || null,
        destination: travel.destination || travel.destination_city || null,
        departure_time: travel.departure_time || null,
        arrival_time: travel.arrival_time || null,
        price: travel.price || null,
        seats_available: travel.seats_available || null,
      };
    }
  },
  Mutation: {
    async createLocalTravel(_, { type, provider, origin, destination, departure_time, arrival_time, price, seats_available }) {
      if (!type || !provider || !origin || !destination || !departure_time || !arrival_time || !price || !seats_available) {
        throw new Error('All fields are required');
      }
      try {
        const res = await fetch(LOCAL_TRAVEL_SERVICE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, provider, origin, destination, departure_time, arrival_time, price, seats_available })
        });
        const data = await res.json();
        if (data.status !== 'success') throw new Error(data.message || 'Failed to create local travel');
        return data.data;
      } catch (err) {
        throw new Error('Local travel creation failed: ' + err.message);
      }
    }
  }
};

module.exports = { typeDefs, resolvers };
