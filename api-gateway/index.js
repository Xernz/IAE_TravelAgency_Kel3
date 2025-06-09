const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const morgan = require('morgan');
const { startApolloServer } = require('./graphql');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
// app.use(express.json()); // Removed to prevent body parsing before proxying
app.use(morgan('dev'));

// Proxy configuration for each microservice
const services = {
  users:    { target: 'http://localhost:3001', path: '/api/users' },
  flights:  { target: 'http://localhost:3002', path: '/api/flights' },
  hotels:   { target: 'http://localhost:3003', path: '/api/hotels' },
  bookings: { target: 'http://localhost:3004', path: '/api/bookings' },
  payments: { target: 'http://localhost:3005', path: '/api/payments' },
  local:    { target: 'http://localhost:3006', path: '/api/local-travel' },
  trains:   { target: 'http://localhost:3007', path: '/api/trains' }
};

// Register proxy routes
Object.values(services).forEach(service => {
  app.use(service.path, createProxyMiddleware({ target: service.target, changeOrigin: true }));
});

app.get('/', (req, res) => {
  res.send('API Gateway is running');
});

// Start Apollo GraphQL Server and then listen
startApolloServer().then((app) => {
  app.listen(PORT, () => {
    console.log(`API Gateway listening on port ${PORT}`);
  });
});
