// GraphQL schema and resolvers for Hotel Service, to be used in API Gateway
const { gql } = require('apollo-server-express');
const fetch = require('node-fetch');

const typeDefs = gql`
  type Hotel {
    id: ID!
    name: String!
    city: String
    province: String
    address: String
    star_rating: Int
    property_type: String
    has_wifi: Boolean
    has_breakfast: Boolean
    rooms: [RoomType]
    pricing: [Pricing]
  }
  type RoomType {
    id: ID!
    name: String
    size: Int
    available: Int
    price: Float
  }
  type Pricing {
    room_type_id: ID!
    date: String!
    price: Float!
  }
  type Query {
    hotels(limit: Int, page: Int): [Hotel]
    hotel(id: ID!): Hotel
    searchHotels(city: String, province: String): [Hotel]
    filterHotels(city: String, province: String, property_type: String, min_star_rating: Int, max_star_rating: Int, min_price: Float, max_price: Float, has_breakfast: Boolean, has_wifi: Boolean, room_size_min: Int, sort_by: String, sort_order: String, page: Int, limit: Int): [Hotel]
    hotelAvailability(id: ID!, check_in: String): [RoomType]
    hotelPricing(id: ID!, check_in: String, check_out: String): [Pricing]
  }
  type Mutation {
    decreaseRoomAvailability(hotelId: ID!, roomTypeId: ID!, date: String!, quantity: Int!): AvailabilityResponse
    increaseRoomAvailability(hotelId: ID!, roomTypeId: ID!, date: String!, quantity: Int!): AvailabilityResponse
  }
  type AvailabilityResponse {
    status: String!
    message: String
    affectedRows: Int
  }
`;

const HOTEL_SERVICE_URL = 'http://localhost:3003/api/hotels';

const resolvers = {
  Query: {
    async hotels(_, { limit, page }) {
      const url = `${HOTEL_SERVICE_URL}?${limit ? `limit=${limit}&` : ''}${page ? `page=${page}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status !== 'success') return [];
      // Map REST fields to GraphQL fields
      return data.data.map(hotel => ({
        id: hotel.id,
        name: hotel.name,
        city: hotel.location || null, // Map 'location' to 'city'
        province: null, // Not provided by REST
        address: null, // Not provided by REST
        star_rating: null, // Not provided by REST
        property_type: null, // Not provided by REST
        has_wifi: null, // Not provided by REST
        has_breakfast: null, // Not provided by REST
        rooms: [], // Not provided by REST
        pricing: [], // Not provided by REST
      }));
    },
    async hotel(_, { id }) {
      const res = await fetch(`${HOTEL_SERVICE_URL}/${id}`);
      const data = await res.json();
      if (data.status !== 'success') return null;
      return data.data;
    },
    async searchHotels(_, { city, province }) {
      let url = `${HOTEL_SERVICE_URL}/search?`;
      if (city) url += `city=${encodeURIComponent(city)}&`;
      if (province) url += `province=${encodeURIComponent(province)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status !== 'success') return [];
      return data.data;
    },
    async filterHotels(_, args) {
      let url = `${HOTEL_SERVICE_URL}/filter?`;
      Object.entries(args).forEach(([key, value]) => {
        if (value !== undefined && value !== null) url += `${key}=${encodeURIComponent(value)}&`;
      });
      const res = await fetch(url);
      const data = await res.json();
      if (data.status !== 'success') return [];
      return data.data;
    },
    async hotelAvailability(_, { id, check_in }) {
      const url = `${HOTEL_SERVICE_URL}/${id}/availability?check_in=${encodeURIComponent(check_in)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status !== 'success') return [];
      return data.data;
    },
    async hotelPricing(_, { id, check_in, check_out }) {
      const url = `${HOTEL_SERVICE_URL}/${id}/pricing?check_in=${encodeURIComponent(check_in)}&check_out=${encodeURIComponent(check_out)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status !== 'success') return [];
      return data.data;
    }
  },
  Mutation: {
    async decreaseRoomAvailability(_, { hotelId, roomTypeId, date, quantity }) {
      if (!hotelId || !roomTypeId || !date || !quantity) {
        throw new Error('hotelId, roomTypeId, date, and quantity are required');
      }
      try {
        const url = `${HOTEL_SERVICE_URL}/${hotelId}/availability/decrease`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room_type_id: roomTypeId, date, quantity })
        });
        const data = await res.json();
        if (data.status !== 'success') throw new Error(data.message || 'Failed to decrease room availability');
        return data;
      } catch (err) {
        throw new Error('Decrease room availability failed: ' + err.message);
      }
    },
    async increaseRoomAvailability(_, { hotelId, roomTypeId, date, quantity }) {
      if (!hotelId || !roomTypeId || !date || !quantity) {
        throw new Error('hotelId, roomTypeId, date, and quantity are required');
      }
      try {
        const url = `${HOTEL_SERVICE_URL}/${hotelId}/availability/increase`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room_type_id: roomTypeId, date, quantity })
        });
        const data = await res.json();
        if (data.status !== 'success') throw new Error(data.message || 'Failed to increase room availability');
        return data;
      } catch (err) {
        throw new Error('Increase room availability failed: ' + err.message);
      }
    }
  }
};

module.exports = { typeDefs, resolvers };
