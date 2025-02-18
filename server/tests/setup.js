const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

// Mock axios for all tests
jest.mock('axios');

// Reset all mocks before each test
beforeAll(() => {
  // Set up test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret';
});

beforeEach(() => {
  jest.clearAllMocks();
}); 