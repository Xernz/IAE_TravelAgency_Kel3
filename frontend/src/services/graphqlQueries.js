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

// Users

// Get all users
export const USERS = gql`
  query Users {
    users {
      id
      name
      email
      phone
      created_at
      updated_at
    }
  }
`;

// Create user
export const CREATE_USER = gql`
  mutation CreateUser($name: String!, $email: String!, $phone: String) {
    createUser(name: $name, email: $email, phone: $phone) {
      id
      name
      email
      phone
      created_at
      updated_at
    }
  }
`;

// Delete user
export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
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


// Booking (Aligned with API Gateway)
export const GET_MY_BOOKINGS = gql`
  query GetMyBookings($userId: ID!) {
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

export const CANCEL_BOOKING = gql`
  mutation CancelBooking($bookingId: ID!) {
    cancelBooking(bookingId: $bookingId)
  }
`;

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

// Flights

// Flight creation (aligned with API Gateway)
export const CREATE_FLIGHT = gql`
  mutation CreateFlight($airline: String!, $flight_number: String!, $origin: String!, $destination: String!, $departure_time: String!, $arrival_time: String!, $price: Float!, $seats_available: Int!) {
    createFlight(
      airline: $airline,
      flight_number: $flight_number,
      origin: $origin,
      destination: $destination,
      departure_time: $departure_time,
      arrival_time: $arrival_time,
      price: $price,
      seats_available: $seats_available
    ) {
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

export const GET_FLIGHTS = gql`
  query GetFlights($origin: String, $destination: String, $date: String) {
    flights(origin: $origin, destination: $destination, date: $date) {
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

// Hotel search by city/province (matches API Gateway's searchHotels)
export const SEARCH_HOTELS = gql`
  query SearchHotels($city: String, $province: String) {
    searchHotels(city: $city, province: $province) {
      id
      name
      city
      province
      address
      star_rating
      property_type
      has_wifi
      has_breakfast
      rooms {
        id
        name
        size
        available
        price
      }
      pricing {
        room_type_id
        date
        price
      }
    }
  }
`;

// Hotel paginated list (matches hotels query)
export const GET_HOTELS = gql`
  query GetHotels($limit: Int, $page: Int) {
    hotels(limit: $limit, page: $page) {
      id
      name
      city
      province
      address
      star_rating
      property_type
      has_wifi
      has_breakfast
    }
  }
`;

// Hotel filtering
export const FILTER_HOTELS = gql`
  query FilterHotels($city: String, $province: String, $property_type: String, $min_star_rating: Int, $max_star_rating: Int, $min_price: Float, $max_price: Float, $has_breakfast: Boolean, $has_wifi: Boolean, $room_size_min: Int, $sort_by: String, $sort_order: String, $page: Int, $limit: Int) {
    filterHotels(city: $city, province: $province, property_type: $property_type, min_star_rating: $min_star_rating, max_star_rating: $max_star_rating, min_price: $min_price, max_price: $max_price, has_breakfast: $has_breakfast, has_wifi: $has_wifi, room_size_min: $room_size_min, sort_by: $sort_by, sort_order: $sort_order, page: $page, limit: $limit) {
      id
      name
      city
      province
      address
      star_rating
      property_type
      has_wifi
      has_breakfast
    }
  }
`;

// Hotel availability
export const HOTEL_AVAILABILITY = gql`
  query HotelAvailability($id: ID!, $check_in: String) {
    hotelAvailability(id: $id, check_in: $check_in) {
      id
      name
      size
      available
      price
    }
  }
`;

// Hotel pricing
export const HOTEL_PRICING = gql`
  query HotelPricing($id: ID!, $check_in: String, $check_out: String) {
    hotelPricing(id: $id, check_in: $check_in, check_out: $check_out) {
      room_type_id
      date
      price
    }
  }
`;

// Decrease room availability
export const DECREASE_ROOM_AVAILABILITY = gql`
  mutation DecreaseRoomAvailability($hotelId: ID!, $roomTypeId: ID!, $date: String!, $quantity: Int!) {
    decreaseRoomAvailability(hotelId: $hotelId, roomTypeId: $roomTypeId, date: $date, quantity: $quantity) {
      status
      message
      affectedRows
    }
  }
`;

// Increase room availability
export const INCREASE_ROOM_AVAILABILITY = gql`
  mutation IncreaseRoomAvailability($hotelId: ID!, $roomTypeId: ID!, $date: String!, $quantity: Int!) {
    increaseRoomAvailability(hotelId: $hotelId, roomTypeId: $roomTypeId, date: $date, quantity: $quantity) {
      status
      message
      affectedRows
    }
  }
`;


// Local Travel

// Local travel creation (aligned with API Gateway)
export const CREATE_LOCAL_TRAVEL = gql`
  mutation CreateLocalTravel($type: String!, $provider: String!, $origin: String!, $destination: String!, $departure_time: String!, $arrival_time: String!, $price: Float!, $seats_available: Int!) {
    createLocalTravel(
      type: $type,
      provider: $provider,
      origin: $origin,
      destination: $destination,
      departure_time: $departure_time,
      arrival_time: $arrival_time,
      price: $price,
      seats_available: $seats_available
    ) {
      id
      type
      provider
      origin
      destination
      departure_time
      arrival_time
      price
      seats_available
    }
  }
`;

export const GET_LOCAL_TRAVEL = gql`
  query GetLocalTravel($origin: String, $destination: String, $date: String) {
    localTravel(origin: $origin, destination: $destination, date: $date) {
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

// Train creation (aligned with API Gateway)
export const CREATE_TRAIN = gql`
  mutation CreateTrain($train_number: String!, $origin: String!, $destination: String!, $departure_time: String!, $arrival_time: String!, $price: Float!, $seats_available: Int!) {
    createTrain(
      train_number: $train_number,
      origin: $origin,
      destination: $destination,
      departure_time: $departure_time,
      arrival_time: $arrival_time,
      price: $price,
      seats_available: $seats_available
    ) {
      id
      train_number
      origin
      destination
      departure_time
      arrival_time
      price
      seats_available
    }
  }
`;

export const GET_TRAINS = gql`
  query GetTrains($origin: String, $destination: String, $date: String) {
    trains(origin: $origin, destination: $destination, date: $date) {
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
