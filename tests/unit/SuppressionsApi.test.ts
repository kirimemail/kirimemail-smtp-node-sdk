// Mock the SmtpClient module completely before any imports
jest.mock('../../src/client/SmtpClient', () => ({
  SmtpClient: jest.fn(),
}), { virtual: true });

// Import after mocking
import { SuppressionsApi } from '../../src/api/SuppressionsApi';
import { Suppression } from '../../src/models/Suppression';
import { Pagination } from '../../src/models/Pagination';
import { createMockKy, mockKyResponse, createSuccessResponse, createPaginatedResponse, resetMockKy, getMockRequests } from '../utils/mockKy';

describe('SuppressionsApi', () => {
  let suppressionsApi: SuppressionsApi;
  let mockKy: any;

  beforeEach(() => {
    jest.clearAllMocks();
    resetMockKy();

    const mockKyImpl = createMockKy();
    
    // Create a mock client that uses the ky instance internally
    const mockClient = {
      // The ky instance that makeRequest will use
      ...mockKyImpl,
      // Override the HTTP methods to call makeRequest like the real SmtpClient
      get: jest.fn().mockImplementation((url: string, params?: any, options?: any) => {
        return mockClient.makeRequest('GET', url, { searchParams: params, headers: options?.headers });
      }),
      post: jest.fn().mockImplementation((url: string, data?: any, options?: any) => {
        return mockClient.makeRequest('POST', url, { json: data, headers: options?.headers });
      }),
      put: jest.fn().mockImplementation((url: string, data?: any, options?: any) => {
        return mockClient.makeRequest('PUT', url, { json: data, headers: options?.headers });
      }),
      delete: jest.fn().mockImplementation((url: string, data?: any, options?: any) => {
        return mockClient.makeRequest('DELETE', url, { json: data, headers: options?.headers });
      }),
      // Add the makeRequest method
      makeRequest: jest.fn().mockImplementation(async (method: string, endpoint: string, options: any) => {
        // Call the ky instance as a function like the real SmtpClient
        const response = await mockKyImpl(endpoint, { ...options, method });
        
        // Handle the response like the real SmtpClient
        if (response.ok) {
          return await response.json();
        } else {
          throw new Error(`Unexpected status code: ${response.status}`);
        }
      }),
    };

    const mockSmtpClient = require('../../src/client/SmtpClient').SmtpClient;
    mockSmtpClient.mockImplementation(() => mockClient);

    suppressionsApi = new SuppressionsApi(mockClient as any);
    mockKy = mockKyImpl;
  });

  describe('getSuppressions', () => {
    it('should get suppressions successfully', async () => {
      const mockData = [
        {
          id: 1,
          recipient: 'test1@example.com',
          type: 'unsubscribe',
          reason: 'User unsubscribed',
          created_at: 1609459200,
        },
        {
          id: 2,
          recipient: 'test2@example.com',
          type: 'bounce',
          reason: 'Hard bounce',
          created_at: 1609459300,
        },
      ];

      const mockPagination = {
        total: 2,
        per_page: 10,
        current_page: 1,
        last_page: 1,
      };

      mockKyResponse('GET', 'api/domains/example.com/suppressions', {
        status: 200,
        ...createPaginatedResponse(mockData, mockPagination),
      });

      const result = await suppressionsApi.getSuppressions('example.com', { limit: 10, type: 'unsubscribe' });

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(Suppression);
      expect(result.data[0].id).toBe(1);
      expect(result.data[0].recipient).toBe('test1@example.com');
      expect(result.data[0].type).toBe('unsubscribe');
      expect(result.data[1].recipient).toBe('test2@example.com');
      expect(result.data[1].type).toBe('bounce');
      expect(result.pagination).toBeInstanceOf(Pagination);
      expect(result.pagination?.total).toBe(2);

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains/example.com/suppressions');
      expect(requests[0].options.method).toBe('GET');
    });

    it('should handle empty suppressions list', async () => {
      mockKyResponse('GET', 'api/domains/example.com/suppressions', {
        status: 200,
        ...createPaginatedResponse([], {
          total: 0,
          per_page: 10,
          current_page: 1,
          last_page: 0,
        }),
      });

      const result = await suppressionsApi.getSuppressions('example.com');

      expect(result.data).toHaveLength(0);
      expect(result.pagination?.total).toBe(0);
    });

    it('should use default pagination when none provided', async () => {
      mockKyResponse('GET', 'api/domains/example.com/suppressions', {
        status: 200,
        ...createPaginatedResponse([], {
          total: 0,
          per_page: 10,
          current_page: 1,
          last_page: 0,
        }),
      });

      await suppressionsApi.getSuppressions('example.com');

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains/example.com/suppressions');
      expect(requests[0].options.method).toBe('GET');
    });

    it('should handle API error', async () => {
      mockKyResponse('GET', 'api/domains/example.com/suppressions', {
        status: 401,
        text: 'Unauthorized',
      });

      await expect(suppressionsApi.getSuppressions('example.com')).rejects.toThrow('Unauthorized');
    });
  });

  describe('getUnsubscribeSuppressions', () => {
    it('should get unsubscribe suppressions successfully', async () => {
      const mockData = [
        {
          id: 1,
          recipient: 'unsub1@example.com',
          type: 'unsubscribe',
          reason: 'User requested unsubscribe',
          created_at: 1609459200,
        },
        {
          id: 3,
          recipient: 'unsub2@example.com',
          type: 'unsubscribe',
          reason: 'User clicked unsubscribe link',
          created_at: 1609459400,
        },
      ];

      const mockPagination = {
        total: 2,
        per_page: 10,
        current_page: 1,
        last_page: 1,
      };

      mockKyResponse('GET', 'api/domains/example.com/suppressions/unsubscribes', {
        status: 200,
        ...createPaginatedResponse(mockData, mockPagination),
      });

      const result = await suppressionsApi.getUnsubscribeSuppressions('example.com', { search: 'unsub' });

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(Suppression);
      expect(result.data[0].type).toBe('unsubscribe');
      expect(result.data[0].recipient).toBe('unsub1@example.com');
      expect(result.data[1].type).toBe('unsubscribe');
      expect(result.data[1].recipient).toBe('unsub2@example.com');
      expect(result.pagination?.total).toBe(2);

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains/example.com/suppressions/unsubscribes');
      expect(requests[0].options.method).toBe('GET');
    });

    it('should handle empty unsubscribe suppressions', async () => {
      mockKyResponse('GET', 'api/domains/example.com/suppressions/unsubscribes', {
        status: 200,
        ...createPaginatedResponse([], {
          total: 0,
          per_page: 10,
          current_page: 1,
          last_page: 0,
        }),
      });

      const result = await suppressionsApi.getUnsubscribeSuppressions('example.com');

      expect(result.data).toHaveLength(0);
    });
  });

  describe('getBounceSuppressions', () => {
    it('should get bounce suppressions successfully', async () => {
      const mockData = [
        {
          id: 2,
          recipient: 'bounce1@example.com',
          type: 'bounce',
          reason: 'Hard bounce - invalid email',
          created_at: 1609459300,
        },
        {
          id: 4,
          recipient: 'bounce2@example.com',
          type: 'bounce',
          reason: 'Soft bounce - mailbox full',
          created_at: 1609459500,
        },
      ];

      const mockPagination = {
        total: 2,
        per_page: 10,
        current_page: 1,
        last_page: 1,
      };

      mockKyResponse('GET', 'api/domains/example.com/suppressions/bounces', {
        status: 200,
        ...createPaginatedResponse(mockData, mockPagination),
      });

      const result = await suppressionsApi.getBounceSuppressions('example.com', { limit: 5 });

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(Suppression);
      expect(result.data[0].type).toBe('bounce');
      expect(result.data[0].recipient).toBe('bounce1@example.com');
      expect(result.data[0].reason).toBe('Hard bounce - invalid email');
      expect(result.pagination?.total).toBe(2);

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains/example.com/suppressions/bounces');
      expect(requests[0].options.method).toBe('GET');
    });
  });

  describe('getWhitelistSuppressions', () => {
    it('should get whitelist suppressions successfully', async () => {
      const mockData = [
        {
          id: 5,
          recipient: 'whitelist1@example.com',
          type: 'whitelist',
          reason: 'Manual whitelist entry',
          created_at: 1609459600,
        },
        {
          id: 6,
          recipient: 'whitelist2@example.com',
          type: 'whitelist',
          reason: 'VIP customer',
          created_at: 1609459700,
        },
      ];

      const mockPagination = {
        total: 2,
        per_page: 10,
        current_page: 1,
        last_page: 1,
      };

      mockKyResponse('GET', 'api/domains/example.com/suppressions/whitelist', {
        status: 200,
        ...createPaginatedResponse(mockData, mockPagination),
      });

      const result = await suppressionsApi.getWhitelistSuppressions('example.com');

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(Suppression);
      expect(result.data[0].type).toBe('whitelist');
      expect(result.data[0].recipient).toBe('whitelist1@example.com');
      expect(result.data[1].type).toBe('whitelist');
      expect(result.data[1].recipient).toBe('whitelist2@example.com');
      expect(result.pagination?.total).toBe(2);

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains/example.com/suppressions/whitelist');
      expect(requests[0].options.method).toBe('GET');
    });
  });

  describe('createWhitelistSuppression', () => {
    it('should create whitelist suppression successfully', async () => {
      const mockSuppressionData = {
        id: 7,
        recipient: 'new-whitelist@example.com',
        type: 'whitelist',
        reason: 'Manual whitelist entry',
        created_at: 1609459800,
      };

      mockKyResponse('POST', 'api/domains/example.com/suppressions/whitelist', {
        status: 201,
        ...createSuccessResponse(mockSuppressionData, { message: 'Whitelist suppression created successfully' }),
      });

      const result = await suppressionsApi.createWhitelistSuppression('example.com', 'new-whitelist@example.com');

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Suppression);
      expect(result.data.recipient).toBe('new-whitelist@example.com');
      expect(result.data.type).toBe('whitelist');
      expect(result.message).toBe('Whitelist suppression created successfully');

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains/example.com/suppressions/whitelist');
      expect(requests[0].options.method).toBe('POST');
      expect(requests[0].options.body).toContain('"recipient":"new-whitelist@example.com"');
    });

    it('should handle invalid email address', async () => {
      mockKyResponse('POST', 'api/domains/example.com/suppressions/whitelist', {
        status: 422,
        text: 'Invalid email address',
      });

      await expect(suppressionsApi.createWhitelistSuppression('example.com', 'invalid-email'))
        .rejects.toThrow('Invalid email address');
    });

    it('should handle duplicate whitelist entry', async () => {
      mockKyResponse('POST', 'api/domains/example.com/suppressions/whitelist', {
        status: 409,
        text: 'Email already whitelisted',
      });

      await expect(suppressionsApi.createWhitelistSuppression('example.com', 'existing@example.com'))
        .rejects.toThrow('Email already whitelisted');
    });
  });

  describe('deleteUnsubscribeSuppressions', () => {
    it('should delete unsubscribe suppressions successfully', async () => {
      mockKyResponse('DELETE', 'api/domains/example.com/suppressions/unsubscribes', {
        status: 200,
        ...createSuccessResponse({}, {
          message: 'Unsubscribe suppressions deleted successfully',
          deleted_count: 2
        }),
      });

      const result = await suppressionsApi.deleteUnsubscribeSuppressions('example.com', [1, 3]);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Unsubscribe suppressions deleted successfully');
      expect(result.deleted_count).toBe(2);

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains/example.com/suppressions/unsubscribes');
      expect(requests[0].options.method).toBe('DELETE');
      expect(requests[0].options.body).toContain('"ids":[1,3]');
    });

    it('should handle non-existent suppression IDs', async () => {
      mockKyResponse('DELETE', 'api/domains/example.com/suppressions/unsubscribes', {
        status: 404,
        text: 'One or more suppressions not found',
      });

      await expect(suppressionsApi.deleteUnsubscribeSuppressions('example.com', [999]))
        .rejects.toThrow('One or more suppressions not found');
    });
  });

  describe('deleteBounceSuppressions', () => {
    it('should delete bounce suppressions successfully', async () => {
      mockKyResponse('DELETE', 'api/domains/example.com/suppressions/bounces', {
        status: 200,
        ...createSuccessResponse({}, {
          message: 'Bounce suppressions deleted successfully',
          deleted_count: 1
        }),
      });

      const result = await suppressionsApi.deleteBounceSuppressions('example.com', [2]);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Bounce suppressions deleted successfully');
      expect(result.deleted_count).toBe(1);

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains/example.com/suppressions/bounces');
      expect(requests[0].options.method).toBe('DELETE');
      expect(requests[0].options.body).toContain('"ids":[2]');
    });
  });

  describe('deleteWhitelistSuppressions', () => {
    it('should delete whitelist suppressions successfully', async () => {
      mockKyResponse('DELETE', 'api/domains/example.com/suppressions/whitelist', {
        status: 200,
        ...createSuccessResponse({}, {
          message: 'Whitelist suppressions deleted successfully',
          deleted_count: 1
        }),
      });

      const result = await suppressionsApi.deleteWhitelistSuppressions('example.com', [5]);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Whitelist suppressions deleted successfully');
      expect(result.deleted_count).toBe(1);

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains/example.com/suppressions/whitelist');
      expect(requests[0].options.method).toBe('DELETE');
      expect(requests[0].options.body).toContain('"ids":[5]');
    });

    it('should handle empty IDs array', async () => {
      mockKyResponse('DELETE', 'api/domains/example.com/suppressions/whitelist', {
        status: 400,
        text: 'No suppression IDs provided',
      });

      await expect(suppressionsApi.deleteWhitelistSuppressions('example.com', []))
        .rejects.toThrow('No suppression IDs provided');
    });
  });

  describe('suppression data transformations', () => {
    it('should properly transform suppression data', async () => {
      const mockData = [
        {
          id: 1,
          recipient: 'test@example.com',
          type: 'unsubscribe',
          reason: 'User requested unsubscribe',
          created_at: 1609459200,
          updated_at: 1609459200,
          source: 'email_link',
        },
      ];

      mockKyResponse('GET', 'api/domains/example.com/suppressions', {
        status: 200,
        ...createPaginatedResponse(mockData, {
          total: 1,
          per_page: 10,
          current_page: 1,
          last_page: 1,
        }),
      });

      const result = await suppressionsApi.getSuppressions('example.com');

      expect(result.data).toHaveLength(1);
      const suppression = result.data[0];
      expect(suppression.id).toBe(1);
      expect(suppression.recipient).toBe('test@example.com');
      expect(suppression.type).toBe('unsubscribe');
      expect(suppression.reason).toBe('User requested unsubscribe');
      expect(suppression.source).toBe('email_link');
    });
  });

  describe('parameter handling', () => {
    it('should handle all parameters correctly', async () => {
      mockKyResponse('GET', 'api/domains/example.com/suppressions', {
        status: 200,
        ...createPaginatedResponse([], {
          total: 0,
          per_page: 10,
          current_page: 1,
          last_page: 0,
        }),
      });

      await suppressionsApi.getSuppressions('example.com', {
        limit: 25,
        page: 2,
        offset: 25,
        type: 'bounce',
        search: 'test@example.com',
      });

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains/example.com/suppressions');
      expect(requests[0].options.method).toBe('GET');
    });
  });
});