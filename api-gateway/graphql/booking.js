// GraphQL schema and resolvers for Booking, to be used in API Gateway
const { gql } = require('apollo-server-express');
const fetch = require('node-fetch');

// Type Definitions (migrated from Booking Service)
const typeDefs = gql`
  scalar JSON
  type Booking {
    id: ID!
    user_id: ID!
    items: [BookingItem!]!
    created_at: String!
    status: String
  }
  type BookingItem {
    id: ID!
    type: String!
    ref_id: ID!
    date: String
    details: JSON
  }
  type Query {
    getBookingById(id: ID!): Booking
    getUserBookings(userId: ID!): [Booking!]!
  }
  type Mutation {
    createBooking(userId: ID!, items: [BookingItemInput!]!): Booking
    cancelBooking(bookingId: ID!): Boolean
    modifyBooking(bookingId: ID!, items: [BookingItemInput!]!): Booking
    initiatePayment(userId: ID!, bookingId: ID!, amount: Float!, method: String!): PaymentResponse!
  }
  type PaymentResponse {
    status: String!
    paymentId: ID
    message: String
  }
  input BookingItemInput {
    type: String!
    refId: ID!
    date: String
    details: JSON
  }
`;

// REST endpoint for the Booking Service
const BOOKING_SERVICE_URL = 'http://localhost:3004/api/bookings';
const PAYMENT_SERVICE_URL = 'http://localhost:3005/api/payments';

const resolvers = {
  Query: {
    async getBookingById(_, { id }) {
      const res = await fetch(`${BOOKING_SERVICE_URL}/${id}`);
      const data = await res.json();
      if (data.status !== 'success') return null;
      return data.data;
    },
    async getUserBookings(_, { userId }) {
      const res = await fetch(`${BOOKING_SERVICE_URL}/user/${userId}`);
      const data = await res.json();
      if (data.status !== 'success') return [];
      return data.data.map(booking => ({
        id: booking.id,
        user_id: booking.user_id || null,
        items: booking.items || [],
        created_at: booking.created_at || null,
        status: booking.status || null,
      }));
    }
  },
  Mutation: {
    async createBooking(_, { userId, items }) {
      const res = await fetch(BOOKING_SERVICE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, items })
      });
      const data = await res.json();
      if (data.status !== 'success') return null;
      return data.data;
    },
    async cancelBooking(_, { bookingId }) {
      const res = await fetch(`${BOOKING_SERVICE_URL}/${bookingId}/cancel`, {
        method: 'POST'
      });
      const data = await res.json();
      return data.status === 'success';
    },
    async modifyBooking(_, { bookingId, items }) {
      const res = await fetch(`${BOOKING_SERVICE_URL}/${bookingId}/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      const data = await res.json();
      if (data.status !== 'success') return null;
      return data.data;
    },
    async initiatePayment(_, { userId, bookingId, amount, method }) {
      try {
        const response = await fetch(PAYMENT_SERVICE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, bookingId, amount, method })
        });
        const data = await response.json();
        return {
          status: data.status,
          paymentId: data.paymentId,
          message: data.message || (data.status === 'success' ? 'Payment initiated' : 'Failed')
        };
      } catch (err) {
        return {
          status: 'error',
          paymentId: null,
          message: 'Failed to connect to payment service'
        };
      }
    }
  }
};

module.exports = { typeDefs, resolvers };
