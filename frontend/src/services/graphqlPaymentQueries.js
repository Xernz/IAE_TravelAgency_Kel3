import { gql } from '@apollo/client';

// Payment (Aligned with API Gateway)
export const CREATE_PAYMENT = gql`
  mutation CreatePayment($userId: ID!, $bookingId: ID!, $amount: Float!, $currency: String, $payment_method_type: String, $payment_reference: String) {
    createPayment(userId: $userId, bookingId: $bookingId, amount: $amount, currency: $currency, payment_method_type: $payment_method_type, payment_reference: $payment_reference) {
      id
      user_id
      booking_id
      amount
      currency
      payment_method_type
      payment_reference
      status
      created_at
      updated_at
    }
  }
`;

export const GET_PAYMENTS = gql`
  query Payments($userId: ID, $bookingId: ID) {
    payments(userId: $userId, bookingId: $bookingId) {
      id
      user_id
      booking_id
      amount
      currency
      payment_method_type
      payment_reference
      status
      created_at
      updated_at
    }
  }
`;

export const GET_PAYMENT_BY_ID = gql`
  query Payment($id: ID!) {
    payment(id: $id) {
      id
      user_id
      booking_id
      amount
      currency
      payment_method_type
      payment_reference
      status
      created_at
      updated_at
    }
  }
`;
