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
    # Backend fields available:
    booking_code: String # present in filter, TODO: ensure always returned in all queries
    payment_status: String # present in filter, TODO: ensure always returned in all queries
    # The following fields are not present in backend yet, add TODOs for future DB migration:
    total_amount: Float # TODO: add to backend and map
    currency: String # TODO: add to backend and map
    special_requests: String # TODO: add to backend and map
    updated_at: String # TODO: add to backend and map
  }
  type BookingItem {
    id: ID!
    type: String!
    ref_id: ID!
    travel_date: String # backend field (was date)
    quantity: Int
    unit_price: Float
    subtotal: Float
    origin_city: String
    destination_city: String
    origin_province: String
    destination_province: String
    service_class: String
    provider: String
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
        items: (booking.items || []).map(item => ({
          id: item.id,
          type: item.type,
          ref_id: item.ref_id,
          travel_date: item.travel_date || item.date || null,
          quantity: item.quantity || null,
          unit_price: item.unit_price || null,
          subtotal: item.subtotal || null,
          origin_city: item.origin_city || null,
          destination_city: item.destination_city || null,
          origin_province: item.origin_province || null,
          destination_province: item.destination_province || null,
          service_class: item.service_class || null,
          provider: item.provider || null,
          details: item.details || null
        })),
        created_at: booking.created_at || null,
        status: booking.status || null,
        booking_code: booking.booking_code || null,
        payment_status: booking.payment_status || null,
        total_amount: booking.total_amount || null,
        currency: booking.currency || null,
        special_requests: booking.special_requests || null,
        updated_at: booking.updated_at || null
      }));
    }
  },
  Mutation: {
    async createBooking(_, { userId, items }) {
      // --- Service endpoint definitions ---
      const SERVICE_ENDPOINTS = {
        hotel: {
          url: 'http://localhost:3003/api/hotels',
          decrease: 'availability/decrease',
          increase: 'availability/increase',
          idField: 'refId',
          payload: (item) => ({
            room_type_id: item.details.roomTypeId,
            date: item.details.checkInDate,
            quantity: item.details.quantity
          })
        },
        train: {
          url: 'http://localhost:3007/api/trains',
          decrease: 'availability/decrease',
          increase: 'availability/increase',
          idField: 'refId',
          payload: (item) => ({
            date: item.details.date,
            quantity: item.details.quantity
          })
        },
        flight: {
          url: 'http://localhost:3002/api/flights',
          decrease: 'availability/decrease',
          increase: 'availability/increase',
          idField: 'refId',
          payload: (item) => ({
            date: item.details.date,
            quantity: item.details.quantity
          })
        },
        local_travel: {
          url: 'http://localhost:3006/api/local-travel',
          decrease: 'availability/decrease',
          increase: 'availability/increase',
          idField: 'refId',
          payload: (item) => ({
            date: item.details.date,
            quantity: item.details.quantity
          })
        }
      };

      // 1. Create the booking
      const res = await fetch(BOOKING_SERVICE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, items })
      });
      const data = await res.json();
      if (data.status !== 'success') return null;
      const booking = data.data;

      // 2. For each booking item, decrease availability atomically
      const decremented = [];
      try {
        for (const item of items) {
          const service = SERVICE_ENDPOINTS[item.type];
          if (service && item.details && service.payload(item)) {
            const endpoint = `${service.url}/${item[service.idField]}/${service.decrease}`;
            const payload = service.payload(item);
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.status !== 'success') throw new Error(result.message || `Failed to decrease availability for ${item.type}`);
            decremented.push({ item, service });
          }
        }
      } catch (err) {
        // Compensate: increase for any previously decremented items
        for (const { item, service } of decremented) {
          try {
            const endpoint = `${service.url}/${item[service.idField]}/${service.increase}`;
            const payload = service.payload(item);
            await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          } catch (rollbackErr) {
            // Log rollback error
            console.error(`Rollback failed for ${item.type}:`, rollbackErr.message);
          }
        }
        // Rollback booking
        await fetch(`${BOOKING_SERVICE_URL}/${booking.id}/cancel`, { method: 'POST' });
        throw new Error('Booking failed: ' + err.message + '. Rolled back booking and compensated decrements.');
      }
      return booking;
    },
    async cancelBooking(_, { bookingId }) {
      // --- Service endpoint definitions (same as in createBooking) ---
      const SERVICE_ENDPOINTS = {
        hotel: {
          url: 'http://localhost:3003/api/hotels',
          increase: 'availability/increase',
          idField: 'ref_id',
          payload: (item) => ({
            room_type_id: item.details.roomTypeId,
            date: item.details.checkInDate,
            quantity: item.details.quantity
          })
        },
        train: {
          url: 'http://localhost:3007/api/trains',
          increase: 'availability/increase',
          idField: 'ref_id',
          payload: (item) => ({
            date: item.details.date,
            quantity: item.details.quantity
          })
        },
        flight: {
          url: 'http://localhost:3002/api/flights',
          increase: 'availability/increase',
          idField: 'ref_id',
          payload: (item) => ({
            date: item.details.date,
            quantity: item.details.quantity
          })
        },
        local_travel: {
          url: 'http://localhost:3006/api/local-travel',
          increase: 'availability/increase',
          idField: 'ref_id',
          payload: (item) => ({
            date: item.details.date,
            quantity: item.details.quantity
          })
        }
      };

      // 1. Fetch booking details to get items
      const bookingRes = await fetch(`${BOOKING_SERVICE_URL}/${bookingId}`);
      const bookingData = await bookingRes.json();
      if (bookingData.status !== 'success') return false;
      const booking = bookingData.data;

      // 2. Cancel the booking
      const res = await fetch(`${BOOKING_SERVICE_URL}/${bookingId}/cancel`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.status !== 'success') return false;

      // 3. For each booking item, increase availability
      for (const item of booking.items || []) {
        const service = SERVICE_ENDPOINTS[item.type];
        if (service && item.details && service.payload(item)) {
          try {
            const endpoint = `${service.url}/${item[service.idField]}/${service.increase}`;
            const payload = service.payload(item);
            await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          } catch (err) {
            // Log error, but booking is already canceled
            console.error(`Availability rollback failed for ${item.type}:`, err.message);
          }
        }
      }
      return true;
    },
    async modifyBooking(_, { bookingId, items }) {
      const res = await fetch(`${BOOKING_SERVICE_URL}/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      const data = await res.json();
      if (data.status !== 'success') return null;
      return data.data;
    }
  }
};

module.exports = { typeDefs, resolvers };
