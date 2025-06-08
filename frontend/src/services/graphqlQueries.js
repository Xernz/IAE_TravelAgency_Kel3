import { gql } from '@apollo/client';

// Login
export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      status
      message
      user {
        id
        name
        email
        phone
        created_at
        updated_at
      }

    }
  }
`;

// Register
export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      status
      message
      user {
        id
        name
        email
        phone
        created_at
        updated_at
      }

    }
  }
`;

// Profile
export const GET_PROFILE = gql`
  query GetProfile {
    profile {
      full_name
      email
      phone_number
      birth_date
      no_nik
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      full_name
      email
      phone_number
      birth_date
      no_nik
    }
  }
`;

// Payment
export const INITIATE_PAYMENT = gql`
  mutation InitiatePayment($userId: Int!, $bookingId: Int!, $amount: Float!, $method: String!) {
    initiatePayment(user_id: $userId, booking_id: $bookingId, amount: $amount, payment_method_type: $method) {
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


// Flights
export const GET_FLIGHTS = gql`
  query GetFlights {
    flights {
      id
      airline
      flight_number
      origin
      destination
      departure_time
      arrival_time
      price
      seats_available
    }
  }
`;

// Hotels
export const GET_HOTELS = gql`
  query GetHotels($page: Int, $limit: Int) {
    hotels(page: $page, limit: $limit) {
      id
      name
      city
      province
      kabupaten
      postal_code
      property_type
    }
  }
`;

// Local Travel
export const GET_LOCAL_TRAVEL = gql`
  query GetLocalTravel($page: Int, $limit: Int, $filters: LocalTravelFilterInput) {
    localTravel(page: $page, limit: $limit, filters: $filters) {
      id
      name
      origin
      destination
      vehicle_model
      price
    }
  }
`;

// Trains
export const GET_TRAINS = gql`
  query GetTrains($page: Int, $limit: Int, $filters: TrainFilterInput) {
    trains(page: $page, limit: $limit, filters: $filters) {
      id
      train_name
      origin_province
      destination_province
      subclass
      train_type
      price_category
    }
  }
`;
