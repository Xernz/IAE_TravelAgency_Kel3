// GraphQL schema and resolvers for Local Travel Service
const { gql } = require('apollo-server-express');
const fetch = require('node-fetch');

const typeDefs = gql`
  type LocalTravel {
    id: ID!
    type: String
    provider: String
    origin: String
    destination: String
    departure_time: String
    arrival_time: String
    price: Float
    seats_available: Int
  }
  type Query {
    localTravels(origin: String, destination: String, date: String): [LocalTravel]
    localTravel(id: ID!): LocalTravel
  }
  type Mutation {
    createLocalTravel(type: String!, provider: String!, origin: String!, destination: String!, departure_time: String!, arrival_time: String!, price: Float!, seats_available: Int!): LocalTravel
  }
`;

const LOCAL_TRAVEL_SERVICE_URL = 'http://localhost:3006/api/local-travel';

const resolvers = {
  Query: {
    async localTravels(_, args) {
      let url = `${LOCAL_TRAVEL_SERVICE_URL}?`;
      Object.entries(args).forEach(([key, value]) => {
        if (value !== undefined && value !== null) url += `${key}=${encodeURIComponent(value)}&`;
      });
      const res = await fetch(url);
      const data = await res.json();
      if (data.status !== 'success') return [];
      return data.data.map(travel => ({
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
      if (data.status !== 'success') return null;
      const travel = data.data;
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
