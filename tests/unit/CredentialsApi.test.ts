// Mock the SmtpClient module completely before any imports
jest.mock('../../src/client/SmtpClient', () => ({
  SmtpClient: jest.fn(),
}), { virtual: true });

// Import after mocking
import { CredentialsApi } from '../../src/api/CredentialsApi';
import { Credential } from '../../src/models/Credential';
import { Pagination } from '../../src/models/Pagination';
import { ApiException, ValidationException, AuthenticationException } from '../../src/exceptions';
import { createMockKy, mockKyResponse, createSuccessResponse, createPaginatedResponse, createErrorResponse, resetMockKy, getMockRequests } from '../utils/mockKy';

const mockSmtpClient = require('../../src/client/SmtpClient').SmtpClient;

describe('CredentialsApi', () => {
  let credentialsApi: CredentialsApi;
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
      delete: jest.fn().mockImplementation((url: string, params?: any, options?: any) => {
        return mockClient.makeRequest('DELETE', url, { searchParams: params, headers: options?.headers });
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

    credentialsApi = new CredentialsApi(mockClient as any);
    mockKy = mockKyImpl;
  });

  describe('listCredentials', () => {
    it('should list credentials successfully', async () => {
      const mockData = [
        {
          id: 1,
          user_smtp_guid: 'guid-1',
          username: 'user1',
          is_verified: true,
          status: true,
          created_at: 1609459200,
        },
        {
          id: 2,
          user_smtp_guid: 'guid-2',
          username: 'user2',
          is_verified: false,
          status: true,
          created_at: 1609459300,
        },
      ];

      const mockPagination = {
        total: 2,
        per_page: 10,
        current_page: 1,
        last_page: 1,
      };

      mockKyResponse('GET', 'api/domains/example.com/credentials', {
        status: 200,
        json: createPaginatedResponse(mockData, mockPagination, { domain: 'example.com' }).json,
      });

      const result = await credentialsApi.listCredentials('example.com', { limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(Credential);
      expect(result.data[0].username).toBe('user1');
      expect(result.data[0].isVerified).toBe(true);
      expect(result.data[1].username).toBe('user2');
      expect(result.data[1].isVerified).toBe(false);
      expect(result.domain).toBe('example.com');
      expect(result.pagination).toBeInstanceOf(Pagination);
      expect(result.pagination?.total).toBe(2);

      // Verify request was made correctly
      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains/example.com/credentials');
      expect(requests[0].options.method).toBe('GET');
    });

    it('should handle empty credentials list', async () => {
      mockKyResponse('GET', 'api/domains/example.com/credentials', {
        status: 200,
        json: createPaginatedResponse([], {
          total: 0,
          per_page: 10,
          current_page: 1,
          last_page: 0,
        }, { domain: 'example.com' }).json,
      });

      const result = await credentialsApi.listCredentials('example.com');

      expect(result.data).toHaveLength(0);
      expect(result.pagination?.total).toBe(0);
    });

    it('should handle API error', async () => {
      mockKyResponse('GET', 'api/domains/example.com/credentials', {
        status: 401,
        text: 'Unauthorized',
      });

      await expect(credentialsApi.listCredentials('example.com')).rejects.toThrow('Unauthorized');
    });

    it('should use default parameters when none provided', async () => {
      mockKyResponse('GET', 'api/domains/example.com/credentials', {
        status: 200,
        json: createPaginatedResponse([], {
          total: 0,
          per_page: 10,
          current_page: 1,
          last_page: 0,
        }, { domain: 'example.com' }).json,
      });

      await credentialsApi.listCredentials('example.com');

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
    });
  });

  describe('createCredential', () => {
    it('should create credential successfully', async () => {
      const mockCredentialData = {
        id: 1,
        user_smtp_guid: 'guid-123',
        username: 'newuser',
        is_verified: false,
        status: true,
        created_at: 1609459200,
      };

      const responseData = {
        credential: mockCredentialData,
        password: 'generated-password-123',
        remote_synced: true,
      };

      mockKyResponse('POST', 'api/domains/example.com/credentials', {
        status: 201,
        json: createSuccessResponse(responseData).json,
      });

      const result = await credentialsApi.createCredential('example.com', 'newuser');

      expect(result.success).toBe(true);
      expect(result.data.credential).toBeInstanceOf(Credential);
      expect(result.data.credential.username).toBe('newuser');
      expect(result.data.credential.password).toBe('generated-password-123');
      expect(result.data.credential.remoteSynced).toBe(true);

      // Verify request was made correctly
      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains/example.com/credentials');
      expect(requests[0].options.method).toBe('POST');
      expect(requests[0].options.body).toContain('"username":"newuser"');
    });

    it('should handle validation error', async () => {
      mockKyResponse('POST', 'api/domains/example.com/credentials', {
        status: 422,
        text: 'Validation failed',
        json: {
          success: false,
          message: 'Validation failed',
          errors: {
            username: ['Username is required'],
          },
        },
      });

      await expect(credentialsApi.createCredential('example.com', '')).rejects.toThrow('Validation failed');
    });
  });

  describe('getCredential', () => {
    it('should get credential successfully', async () => {
      const mockCredentialData = {
        id: 1,
        user_smtp_guid: 'guid-123',
        username: 'testuser',
        is_verified: true,
        status: true,
        created_at: 1609459200,
      };

      mockKyResponse('GET', 'api/domains/example.com/credentials/1', {
        status: 200,
        json: createSuccessResponse(mockCredentialData).json,
      });

      const result = await credentialsApi.getCredential('example.com', '1');

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Credential);
      expect(result.data.username).toBe('testuser');
      expect(result.data.isVerified).toBe(true);

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains/example.com/credentials/1');
      expect(requests[0].options.method).toBe('GET');
    });

    it('should handle not found error', async () => {
      mockKyResponse('GET', 'api/domains/example.com/credentials/999', {
        status: 404,
        text: 'Credential not found',
      });

      await expect(credentialsApi.getCredential('example.com', '999')).rejects.toThrow('Credential not found');
    });
  });

  describe('deleteCredential', () => {
    it('should delete credential successfully', async () => {
      mockKyResponse('DELETE', 'api/domains/example.com/credentials/1', {
        status: 200,
        json: createSuccessResponse({}, { message: 'Credential deleted successfully' }).json,
      });

      const result = await credentialsApi.deleteCredential('example.com', '1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Credential deleted successfully');

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains/example.com/credentials/1');
      expect(requests[0].options.method).toBe('DELETE');
    });

    it('should handle unauthorized error', async () => {
      mockKyResponse('DELETE', 'api/domains/example.com/credentials/1', {
        status: 403,
        text: 'Unauthorized to delete this credential',
      });

      await expect(credentialsApi.deleteCredential('example.com', '1')).rejects.toThrow('Unauthorized to delete this credential');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const mockCredentialData = {
        id: 1,
        user_smtp_guid: 'guid-123',
        username: 'testuser',
        is_verified: true,
        status: true,
        created_at: 1609459200,
      };

      const responseData = {
        credential: mockCredentialData,
        new_password: 'new-generated-password-456',
        strength_info: {
          strength: 'strong',
          score: 9,
        },
        remote_synced: true,
      };

      mockKyResponse('PUT', 'api/domains/example.com/credentials/1/reset-password', {
        status: 200,
        json: createSuccessResponse(responseData).json,
      });

      const result = await credentialsApi.resetPassword('example.com', '1');

      expect(result.success).toBe(true);
      expect(result.data.credential).toBeInstanceOf(Credential);
      expect(result.data.credential.password).toBe('new-generated-password-456');
      expect(result.data.credential.strengthInfo).toEqual({
        strength: 'strong',
        score: 9,
      });
      expect(result.data.credential.remoteSynced).toBe(true);
      expect(result.data.new_password).toBe('new-generated-password-456');

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains/example.com/credentials/1/reset-password');
      expect(requests[0].options.method).toBe('PUT');
    });

    it('should handle server error', async () => {
      mockKyResponse('PUT', 'api/domains/example.com/credentials/1/reset-password', {
        status: 500,
        text: 'Internal server error',
      });

      await expect(credentialsApi.resetPassword('example.com', '1')).rejects.toThrow('Internal server error');
    });
  });

  describe('error handling', () => {
    it('should re-throw ApiException with additional context', async () => {
      const apiException = new ApiException('API Error occurred');

      // Get the mock client instance
      const mockClient = credentialsApi['client'] as any;
      
      // Mock the get method to throw an ApiException
      mockClient.get.mockRejectedValue(apiException);

      await expect(credentialsApi.listCredentials('example.com')).rejects.toThrow('API Error occurred');
    });
  });
});