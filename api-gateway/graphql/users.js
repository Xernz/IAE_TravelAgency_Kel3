// GraphQL schema and resolvers for Users Service
const { gql } = require('apollo-server-express');
const fetch = require('node-fetch');

const typeDefs = gql`
  type User {
    id: ID!
    name: String
    email: String
    phone: String
    created_at: String
    updated_at: String
  }
  type AuthPayload {
    status: String!
    message: String
    user: User
  }
  input RegisterInput {
    email: String!
    password: String!
    full_name: String!
    phone_number: String
    birth_date: String!
    no_nik: String!
    address: String
    kelurahan: String
    kecamatan: String
    kabupaten_kota: String
    province: String
    postal_code: String
  }
  type Query {
    users: [User]
    user(id: ID!): User
  }
  type Mutation {
    createUser(name: String!, email: String!, phone: String): User
    updateUser(id: ID!, name: String, email: String, phone: String): User
    deleteUser(id: ID!): Boolean
    login(email: String!, password: String!): AuthPayload
    register(input: RegisterInput!): AuthPayload
  }
`;

const USERS_SERVICE_URL = 'http://localhost:3001/api/users';

const resolvers = {
  Query: {
    async users() {
      const res = await fetch(USERS_SERVICE_URL);
      const data = await res.json();
      if (data.status !== 'success') return [];
      return data.data.map(user => ({
        id: user.id,
        name: user.name || user.full_name || null,
        email: user.email || null,
        phone: user.phone || user.phone_number || null,
        created_at: user.created_at || null,
        updated_at: user.updated_at || null,
      }));
    },
    async user(_, { id }) {
      const res = await fetch(`${USERS_SERVICE_URL}/${id}`);
      const data = await res.json();
      if (data.status !== 'success') return null;
      const user = data.data;
      return {
        id: user.id,
        name: user.name || user.full_name || null,
        email: user.email || null,
        phone: user.phone || user.phone_number || null,
        created_at: user.created_at || null,
        updated_at: user.updated_at || null,
      };
    }
  },
  Mutation: {
    async login(_, { email, password }) {
      if (!email || !password) throw new Error('Email and password are required');
      try {
        const res = await fetch(USERS_SERVICE_URL + '/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.status !== 'success') throw new Error(data.message || 'Login failed');
        return {
          status: data.status,
          message: data.message,
          user: data.data,
          token: data.token
        };
      } catch (err) {
        throw new Error('Login failed: ' + err.message);
      }
    },
    async register(_, { input }) {
      if (!input.email || !input.password || !input.full_name || !input.birth_date || !input.no_nik) {
        throw new Error('Missing required fields');
      }
      try {
        const res = await fetch(USERS_SERVICE_URL + '/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });
        const data = await res.json();
        if (data.status !== 'success') throw new Error(data.message || 'Registration failed');
        return {
          status: data.status,
          message: data.message,
          user: data.data,
          token: data.token
        };
      } catch (err) {
        throw new Error('Registration failed: ' + err.message);
      }
    },
    async createUser(_, { name, email, phone }) {
      if (!name || !email) {
        throw new Error('Name and email are required');
      }
      try {
        const res = await fetch(USERS_SERVICE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone })
        });
        const data = await res.json();
        if (data.status !== 'success') throw new Error(data.message || 'Failed to create user');
        return data.data;
      } catch (err) {
        throw new Error('User creation failed: ' + err.message);
      }
    },
    async updateUser(_, { id, name, email, phone }) {
      if (!id) throw new Error('User ID is required');
      try {
        const res = await fetch(`${USERS_SERVICE_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone })
        });
        const data = await res.json();
        if (data.status !== 'success') throw new Error(data.message || 'Failed to update user');
        return data.data;
      } catch (err) {
        throw new Error('User update failed: ' + err.message);
      }
    },
    async deleteUser(_, { id }) {
      if (!id) throw new Error('User ID is required');
      try {
        const res = await fetch(`${USERS_SERVICE_URL}/${id}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (data.status !== 'success') throw new Error(data.message || 'Failed to delete user');
        return true;
      } catch (err) {
        throw new Error('User deletion failed: ' + err.message);
      }
    }
  }
};

module.exports = { typeDefs, resolvers };
