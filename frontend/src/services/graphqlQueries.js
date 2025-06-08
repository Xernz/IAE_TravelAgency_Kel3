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


export const FILTER_FLIGHTS = gql`
  query FilterFlights(
    $origin_city: String
    $destination_city: String
    $origin_code: String
    $destination_code: String
    $airline_name: String
    $airline_code: String
    $flight_class: String
    $departure_date: String # Format YYYY-MM-DD
    $min_price: Float
    $max_price: Float
    $sort_by: String # e.g., "price", "departure_time"
    $sort_order: String # "ASC" or "DESC"
    $page: Int
    $limit: Int
  ) {
    filterFlights(
      filter: {
        origin_city: $origin_city
        destination_city: $destination_city
        origin_code: $origin_code
        destination_code: $destination_code
        airline_name: $airline_name
        airline_code: $airline_code
        flight_class: $flight_class
        departure_date: $departure_date
        min_price: $min_price
        max_price: $max_price
      }
      sort: {
        by: $sort_by
        order: $sort_order
      }
      pagination: {
        page: $page
        limit: $limit
      }
    ) {
      flights {
        id
        airline_code
        airline_name
        flight_number
        origin_city
        destination_city
        origin_code
        destination_code
        departure_time
        arrival_time
        duration
        flight_class
        price
        seats_available
        currency
        stops
        status
      }
      pagination {
        total_items
        total_pages
        current_page
        limit
      }
    }
  }
`;

export const CREATE_FLIGHT_BOOKING = gql`
  mutation CreateFlightBooking(
    $userId: ID!,
    $flightId: ID!,
    $numberOfPassengers: Int!
  ) {
    createFlight(
      userId: $userId,
      flightId: $flightId,
      numberOfPassengers: $numberOfPassengers
    ) {
      id                # Booking ID
      user_id
      flight_id         # Confirms which flight was booked
      number_of_passengers
      status            # e.g., "CONFIRMED", "PENDING_PAYMENT"
      created_at
      updated_at
    }
  }
`;

// Local Travel Booking
export const CREATE_LOCAL_TRAVEL_BOOKING = gql`
  mutation CreateLocalTravelBooking($userId: ID!, $localTravelId: ID!) {
    createLocalTravel(userId: $userId, localTravelId: $localTravelId) {
      id
      user_id
      local_travel_id
      status
      created_at
      updated_at
    }
  }
`;

// Train Booking
export const CREATE_TRAIN_BOOKING = gql`
  mutation CreateTrainBooking($userId: ID!, $trainId: ID!, $numberOfSeats: Int!) {
    createTrain(userId: $userId, trainId: $trainId, numberOfSeats: $numberOfSeats) {
      id
      user_id
      train_id
      number_of_seats
      status
      created_at
      updated_at
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
export const FILTER_HOTELS = gql`
  query FilterHotels(
    $name: String
    $city: String
    $province: String
    $country: String
    $property_type: String
    $min_star_rating: Float
    $max_star_rating: Float
    $amenities_include: [String!]
    $is_pet_friendly: Boolean
    $sortBy: String
    $sortOrder: SortOrder
    $page: Int
    $limit: Int
  ) {
    filterHotels(
      filters: {
        name: $name
        city: $city
        province: $province
        country: $country
        property_type: $property_type
        min_star_rating: $min_star_rating
        max_star_rating: $max_star_rating
        amenities_include: $amenities_include
        is_pet_friendly: $is_pet_friendly
      }
      sort: {
        sortBy: $sortBy
        sortOrder: $sortOrder
      }
      pagination: {
        page: $page
        limit: $limit
      }
    ) {
      hotels {
        id
        name
        city
        province
        country
        address
        postal_code
        star_rating
        property_type
        description
        amenities # Array of strings
        images # Array of strings (URLs)
        has_wifi
        has_breakfast
        has_parking
        is_pet_friendly
        min_price_per_night
        max_price_per_night
      }
      pagination {
        totalItems
        totalPages
        currentPage
        pageSize
      }
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

// Create Hotel Booking
export const CREATE_HOTEL_BOOKING = gql`
  mutation CreateHotelBooking(
    $userId: ID!
    $hotelId: ID!
    $roomTypeId: ID!
    $checkInDate: String!
    $checkOutDate: String!
    $numberOfGuests: Int!
    $totalPrice: Float! 
    # Consider adding other relevant fields like guest details, special requests
  ) {
    createHotelBooking(
      input: {
        userId: $userId
        hotelId: $hotelId
        roomTypeId: $roomTypeId
        checkInDate: $checkInDate
        checkOutDate: $checkOutDate
        numberOfGuests: $numberOfGuests
        totalPrice: $totalPrice
        # Ensure this input structure matches backend expectations
      }
    ) {
      id # Booking ID
      user_id # or userId, ensure consistency
      hotel_id # or hotelId
      room_type_id # or roomTypeId
      check_in_date
      check_out_date
      number_of_guests
      total_price
      status # e.g., CONFIRMED, PENDING_PAYMENT
      created_at
      updated_at
      # Include any other fields from the booking object that are useful to return
    }
  }
`;



// Local Travel

// Local travel creation (aligned with API Gateway)

export const FILTER_LOCAL_TRAVELS = gql`
  query FilterLocalTravels(
    $origin_city: String
    $destination_city: String
    $origin_province: String
    $destination_province: String
    $origin_kabupaten: String
    $destination_kabupaten: String
    $date: String # Format "YYYY-MM-DD"
    $type: String # e.g., "taxi", "ojek", "bus"
    $operator_name: String
    $provider: String
    $min_capacity: Int
    $max_capacity: Int
    $amenities_include_any: [String!]
    $amenities_include_all: [String!]
    $min_price: Float
    $max_price: Float
    $sort_by: String # e.g., "name", "price"
    $sort_order: String # "ASC" or "DESC"
    $page: Int
    $limit: Int
  ) {
    filterLocalTravels(
      filter: {
        origin_city: $origin_city
        destination_city: $destination_city
        origin_province: $origin_province
        destination_province: $destination_province
        origin_kabupaten: $origin_kabupaten
        destination_kabupaten: $destination_kabupaten
        date: $date
        type: $type
        operator_name: $operator_name
        provider: $provider
        min_capacity: $min_capacity
        max_capacity: $max_capacity

        min_price: $min_price
        max_price: $max_price
      }
      sort: {
        by: $sort_by
        order: $sort_order
      }
      pagination: {
        page: $page
        limit: $limit
      }
    ) {
      localTravels {
        id
        name
        type
        provider
        operator_name
        origin_city
        destination_city
        origin_province
        destination_province
        departure_time
        arrival_time
        duration
        price
        currency
        seats_available
        capacity
        vehicle_model
        has_ac
        has_wifi
        amenities # Array of strings
        images # Array of strings (URLs)
      }
      pagination {
        total_items
        total_pages
        current_page
        limit
      }
    }
  }
`;

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

// Advanced filter query for TrainList.js (matches backend and GraphQL API)
// Advanced filter query for TrainList.js (matches backend and GraphQL API)
export const FILTER_TRAINS = gql`
  query FilterTrains(
    $filters: TrainFiltersInput
    $sort: TrainSortInput
    $pagination: PaginationInput
  ) {
    filterTrains(filters: $filters, sort: $sort, pagination: $pagination) {
      trains {
        id
        train_number
        origin_station_name
        destination_station_name
        origin_city
        destination_city
        origin_province
        destination_province
        departure_time
        arrival_time
        price
        seats_available
        train_class
        subclass
        train_type
        operator
        duration
      }
      pagination {
        totalItems
        totalPages
        currentPage
        pageSize
        hasNextPage
        hasPrevPage
      }
    }
  }
`;
