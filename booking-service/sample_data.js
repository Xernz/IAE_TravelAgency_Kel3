// Sample data for bookings only (Booking Service owns only bookings)

// Bookings: Only one of flightId or hotelId should be set per booking
// For flight bookings, use the flight's date as the booking date (no end date)
const bookings = [
  {
    bookingId: 'BKG1001',
    customerId: 'CUST001',
    flightId: 'FL001',
    hotelId: null,
    date: '2025-05-10', // flight date
    status: 'confirmed',
  },
  {
    bookingId: 'BKG1002',
    customerId: 'CUST002',
    flightId: null,
    hotelId: 'HT002',
    startDate: '2025-06-01',
    endDate: '2025-06-05',
    status: 'confirmed',
  },
];

module.exports = { bookings };
