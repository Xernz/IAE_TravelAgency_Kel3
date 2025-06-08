// GraphQL schema and resolvers for Train Service
const { gql } = require('apollo-server-express');
const fetch = require('node-fetch');

const typeDefs = gql`
  type Train {
    id: ID!
    train_number: String
    origin: String
    destination: String
    departure_time: String
    arrival_time: String
    price: Float
    seats_available: Int
  }
  type Query {
    trains(origin: String, destination: String, date: String): [Train]
    train(id: ID!): Train
  }
  type Mutation {
    createTrain(train_number: String!, origin: String!, destination: String!, departure_time: String!, arrival_time: String!, price: Float!, seats_available: Int!): Train
  }
`;

const TRAIN_SERVICE_URL = 'http://localhost:3007/api/trains';

const resolvers = {
  Query: {
    async trains(_, args) {
      let url = `${TRAIN_SERVICE_URL}?`;
      Object.entries(args).forEach(([key, value]) => {
        if (value !== undefined && value !== null) url += `${key}=${encodeURIComponent(value)}&`;
      });
      const res = await fetch(url);
      const data = await res.json();
      if (data.status !== 'success') return [];
      return data.data.map(train => ({
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
      if (data.status !== 'success') return null;
      const train = data.data;
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
