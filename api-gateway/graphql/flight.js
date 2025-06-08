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
  }
  type Query {
    flights(origin: String, destination: String, date: String): [Flight]
    flight(id: ID!): Flight
  }
  type Mutation {
    createFlight(airline: String!, flight_number: String!, origin: String!, destination: String!, departure_time: String!, arrival_time: String!, price: Float!, seats_available: Int!): Flight
  }
`;

const FLIGHT_SERVICE_URL = 'http://localhost:3002/api/flights';

const resolvers = {
  Query: {
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
      if (data.status !== 'success') return [];
      return data.data.map(flight => ({
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
      if (data.status !== 'success') return null;
      const flight = data.data;
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
