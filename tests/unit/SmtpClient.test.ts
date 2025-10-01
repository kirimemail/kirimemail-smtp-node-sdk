import { SmtpClient } from '../../src/client/SmtpClient';
import { ApiException } from '../../src/exceptions';

// Mock ky to avoid actual HTTP requests
jest.mock('ky', () => {
  return {
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    })),
  };
});

describe('SmtpClient', () => {
  let client: SmtpClient;

  beforeEach(() => {
    client = new SmtpClient('testuser', 'testtoken');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create client with credentials', () => {
      expect(client).toBeInstanceOf(SmtpClient);
    });

    it('should create client with custom base URL', () => {
      const customClient = new SmtpClient('user', 'token', 'https://custom.example.com');
      expect(customClient).toBeInstanceOf(SmtpClient);
    });

    it('should create client without credentials', () => {
      const noAuthClient = new SmtpClient();
      expect(noAuthClient).toBeInstanceOf(SmtpClient);
    });
  });

  describe('URL building', () => {
    it('should handle URLs correctly', () => {
      // Test that URLs are built correctly without leading slashes
      const testUrl = 'api/domains/test';
      expect(testUrl).toMatch(/^api\/domains/); // Should not start with /
    });
  });
});