// Apollo Server setup for API Gateway, combining all schemas/resolvers
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const { typeDefs: bookingTypeDefs, resolvers: bookingResolvers } = require('./booking');
const { typeDefs: hotelTypeDefs, resolvers: hotelResolvers } = require('./hotel');
const { typeDefs: usersTypeDefs, resolvers: usersResolvers } = require('./users');
const { typeDefs: paymentTypeDefs, resolvers: paymentResolvers } = require('./payment');
const { typeDefs: flightTypeDefs, resolvers: flightResolvers } = require('./flight');
const { typeDefs: trainTypeDefs, resolvers: trainResolvers } = require('./train');
const { typeDefs: localTravelTypeDefs, resolvers: localTravelResolvers } = require('./localTravel');

const app = express();

// Combine all typeDefs and resolvers (add more as you expand other domains)
const typeDefs = [
  bookingTypeDefs,
  hotelTypeDefs,
  usersTypeDefs,
  paymentTypeDefs,
  flightTypeDefs,
  trainTypeDefs,
  localTravelTypeDefs
];
const resolvers = [
  bookingResolvers,
  hotelResolvers,
  usersResolvers,
  paymentResolvers,
  flightResolvers,
  trainResolvers,
  localTravelResolvers
];

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
  return app;
}

module.exports = { startApolloServer, app };
