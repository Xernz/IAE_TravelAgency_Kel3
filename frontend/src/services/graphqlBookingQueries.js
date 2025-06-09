import { gql } from '@apollo/client';

// Get all bookings for a user
export const GET_MY_BOOKINGS = gql`
  query GetUserBookings($userId: ID!) {
    getUserBookings(userId: $userId) {
      id
      user_id
      items {
        id
        type
        ref_id
        date
        details
      }
      created_at
      status
    }
  }
`;

// Get booking by ID
export const GET_BOOKING_BY_ID = gql`
  query GetBookingById($id: ID!) {
    getBookingById(id: $id) {
      id
      user_id
      items {
        id
        type
        ref_id
        date
        details
      }
      created_at
      status
    }
  }
`;

// Create a new booking
export const CREATE_BOOKING = gql`
  mutation CreateBooking($userId: ID!, $items: [BookingItemInput!]!) {
    createBooking(userId: $userId, items: $items) {
      id
      user_id
      items {
        id
        type
        ref_id
        date
        details
      }
      created_at
      status
    }
  }
`;

// Cancel a booking
export const CANCEL_BOOKING = gql`
  mutation CancelBooking($bookingId: ID!) {
    cancelBooking(bookingId: $bookingId)
  }
`;

// Modify a booking
export const MODIFY_BOOKING = gql`
  mutation ModifyBooking($bookingId: ID!, $items: [BookingItemInput!]!) {
    modifyBooking(bookingId: $bookingId, items: $items) {
      id
      user_id
      items {
        id
        type
        ref_id
        date
        details
      }
      created_at
      status
    }
  }
`;
