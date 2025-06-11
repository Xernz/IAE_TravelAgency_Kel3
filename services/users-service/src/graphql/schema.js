const { gql } = require('apollo-server-express');
const User = require('../models/User');

// GraphQL Schema Definition Language (SDL)
const typeDefs = gql`
  type User {
    id: ID
    email: String
    full_name: String
    phone_number: String
    birth_date: String
    no_nik: String
    address: String
    kelurahan: String
    kecamatan: String
    kabupaten_kota: String
    province: String
    postal_code: String
    created_at: String
  }

  type Query {
    userByEmail(email: String!): User
  }
`;

// Resolvers
const resolvers = {
  Query: {
    userByEmail: async (_, { email }) => {
      try {
        const user = await User.getByEmail(email);
        if (!user) {
          return null;
        }
        // Ensure password is not returned
        const { password, ...userData } = user;
        return userData;
      } catch (error) {
        console.error('Error in userByEmail resolver:', error);
        throw new Error('Failed to fetch user data.');
      }
    },
  },
};

module.exports = { typeDefs, resolvers };

