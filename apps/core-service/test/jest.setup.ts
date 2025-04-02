import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Increase timeout for all tests
jest.setTimeout(30000);
