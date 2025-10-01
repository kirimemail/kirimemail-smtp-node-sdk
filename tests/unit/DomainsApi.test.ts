// Mock the SmtpClient module completely before any imports
jest.mock('../../src/client/SmtpClient', () => ({
  SmtpClient: jest.fn(),
}), { virtual: true });

// Import after mocking
import { DomainsApi } from '../../src/api/DomainsApi';
import { Domain } from '../../src/models/Domain';
import { Pagination } from '../../src/models/Pagination';
import { createMockKy, mockKyResponse, createSuccessResponse, createPaginatedResponse, createErrorResponse, resetMockKy, getMockRequests } from '../utils/mockKy';

describe('DomainsApi', () => {
  let domainsApi: DomainsApi;
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

    domainsApi = new DomainsApi(mockClient as any);
    mockKy = mockKyImpl;
  });

  describe('listDomains', () => {
    it('should list domains successfully', async () => {
      const mockData = [
        {
          domain: 'example.com',
          is_verified: true,
          dkim_public_key: 'pub-key-123',
          created_at: 1609459200,
        },
        {
          domain: 'test.com',
          is_verified: false,
          dkim_public_key: 'pub-key-456',
          created_at: 1609459300,
        },
      ];

      const mockPagination = {
        total: 2,
        per_page: 10,
        current_page: 1,
        last_page: 1,
      };

      mockKyResponse('GET', 'api/domains', {
        status: 200,
        ...createPaginatedResponse(mockData, mockPagination),
      });

      const result = await domainsApi.listDomains({ limit: 10, search: 'example' });

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(Domain);
      expect(result.data[0].domain).toBe('example.com');
      expect(result.data[0].isVerified).toBe(true);
      expect(result.data[1].domain).toBe('test.com');
      expect(result.data[1].isVerified).toBe(false);
      expect(result.pagination).toBeInstanceOf(Pagination);
      expect(result.pagination?.total).toBe(2);

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains');
      expect(requests[0].options.method).toBe('GET');
    });

    it('should handle empty domains list', async () => {
      mockKyResponse('GET', 'api/domains', {
        status: 200,
        ...createPaginatedResponse([], {
          total: 0,
          per_page: 10,
          current_page: 1,
          last_page: 0,
        }),
      });

      const result = await domainsApi.listDomains();

      expect(result.data).toHaveLength(0);
      expect(result.pagination?.total).toBe(0);
    });

    it('should use default parameters when none provided', async () => {
      mockKyResponse('GET', 'api/domains', {
        status: 200,
        ...createPaginatedResponse([], {
          total: 0,
          per_page: 10,
          current_page: 1,
          last_page: 0,
        }),
      });

      await domainsApi.listDomains();

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
    });
  });

  describe('createDomain', () => {
    it('should create domain successfully', async () => {
      const createOptions = {
        domain: 'newdomain.com',
        dkim_key_length: 2048 as 2048 | 1024,
      };

      mockKyResponse('POST', 'api/domains', {
        status: 201,
        ...createSuccessResponse({
          domain: 'newdomain.com',
        }, { message: 'Domain created successfully' }),
      });

      const result = await domainsApi.createDomain(createOptions);

      expect(result.success).toBe(true);
      expect(result.data.domain).toBe('newdomain.com');
      expect(result.message).toBe('Domain created successfully');

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains');
      expect(requests[0].options.method).toBe('POST');
      expect(requests[0].options.body).toContain('"domain":"newdomain.com"');
      expect(requests[0].options.body).toContain('"dkim_key_length":2048');
    });

    it('should handle validation error', async () => {
      const invalidOptions = {
        domain: '',
        dkim_key_length: 1024 as 2048 | 1024,
      };

      mockKyResponse('POST', 'api/domains', {
        status: 422,
        text: 'Validation failed',
      });

      await expect(domainsApi.createDomain(invalidOptions)).rejects.toThrow('Validation failed');
    });
  });

  describe('getDomain', () => {
    it('should get domain successfully', async () => {
      const mockDomainData = {
        domain: 'example.com',
        is_verified: true,
        dkim_public_key: 'pub-key-123',
        dkim_selector: 'default',
        created_at: 1609459200,
        updated_at: 1609459200,
      };

      mockKyResponse('GET', 'api/domains/example.com', {
        status: 200,
        ...createSuccessResponse(mockDomainData),
      });

      const result = await domainsApi.getDomain('example.com');

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Domain);
      expect(result.data.domain).toBe('example.com');
      expect(result.data.isVerified).toBe(true);
      expect(result.data.dkimPublicKey).toBe('pub-key-123');
      expect(result.data.dkimSelector).toBe('default');

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains/example.com');
      expect(requests[0].options.method).toBe('GET');
    });

    it('should handle not found error', async () => {
      mockKyResponse('GET', 'api/domains/nonexistent.com', {
        status: 404,
        text: 'Domain not found',
      });

      await expect(domainsApi.getDomain('nonexistent.com')).rejects.toThrow('Domain not found');
    });
  });

  describe('updateDomain', () => {
    it('should update domain successfully', async () => {
      const trackingSettings = {
        open_track: true,
        click_track: false,
        unsub_track: true,
      };

      mockKyResponse('PUT', 'api/domains/example.com', {
        status: 200,
        ...createSuccessResponse(trackingSettings, {
          message: 'Domain tracking settings updated',
        }),
      });

      const result = await domainsApi.updateDomain('example.com', trackingSettings);

      expect(result.success).toBe(true);
      expect(result.data.open_track).toBe(true);
      expect(result.data.click_track).toBe(false);
      expect(result.data.unsub_track).toBe(true);

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains/example.com');
      expect(requests[0].options.method).toBe('PUT');
      expect(requests[0].options.body).toContain('"open_track":true');
    });
  });

  describe('deleteDomain', () => {
    it('should delete domain successfully', async () => {
      mockKyResponse('DELETE', 'api/domains/example.com', {
        status: 200,
        ...createSuccessResponse({}, { message: 'Domain deleted successfully' }),
      });

      const result = await domainsApi.deleteDomain('example.com');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Domain deleted successfully');

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains/example.com');
      expect(requests[0].options.method).toBe('DELETE');
    });

    it('should handle unauthorized error', async () => {
      mockKyResponse('DELETE', 'api/domains/example.com', {
        status: 403,
        text: 'Unauthorized to delete this domain',
      });

      await expect(domainsApi.deleteDomain('example.com')).rejects.toThrow('Unauthorized to delete this domain');
    });
  });

  describe('setupAuthDomain', () => {
    it('should setup auth domain successfully', async () => {
      const options = {
        auth_domain: 'auth.example.com',
        dkim_key_length: 2048 as 2048 | 1024,
      };

      mockKyResponse('POST', 'api/domains/example.com/setup-auth-domain', {
        status: 201,
        ...createSuccessResponse({
          auth_domain: 'auth.example.com',
        }, { message: 'Authentication domain setup initiated' }),
      });

      const result = await domainsApi.setupAuthDomain('example.com', options);

      expect(result.success).toBe(true);
      expect(result.data.auth_domain).toBe('auth.example.com');

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains/example.com/setup-auth-domain');
      expect(requests[0].options.method).toBe('POST');
      expect(requests[0].options.body).toContain('"auth_domain":"auth.example.com"');
    });
  });

  describe('verifyMandatoryRecords', () => {
    it('should verify mandatory records successfully', async () => {
      mockKyResponse('POST', 'api/domains/example.com/verify-mandatory', {
        status: 200,
        ...createSuccessResponse({
          records: {
            dkim: true,
            spf: true,
            mx: true,
          },
        }),
      });

      const result = await domainsApi.verifyMandatoryRecords('example.com');

      expect(result.success).toBe(true);
      expect(result.data.records.dkim).toBe(true);
      expect(result.data.records.spf).toBe(true);
      expect(result.data.records.mx).toBe(true);

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains/example.com/verify-mandatory');
      expect(requests[0].options.method).toBe('POST');
    });

    it('should handle failed verification', async () => {
      mockKyResponse('POST', 'api/domains/example.com/verify-mandatory', {
        status: 200,
        ...createSuccessResponse({
          records: {
            dkim: false,
            spf: true,
            mx: false,
          },
        }),
      });

      const result = await domainsApi.verifyMandatoryRecords('example.com');

      expect(result.success).toBe(true);
      expect(result.data.records.dkim).toBe(false);
      expect(result.data.records.mx).toBe(false);
    });
  });

  describe('verifyAuthDomainRecords', () => {
    it('should verify auth domain records successfully', async () => {
      mockKyResponse('POST', 'api/domains/example.com/verify-auth-domain', {
        status: 200,
        ...createSuccessResponse({
          records: {
            auth_dkim: true,
            auth_spf: true,
            auth_mx: true,
          },
        }),
      });

      const result = await domainsApi.verifyAuthDomainRecords('example.com');

      expect(result.success).toBe(true);
      expect(result.data.records.auth_dkim).toBe(true);
      expect(result.data.records.auth_spf).toBe(true);
      expect(result.data.records.auth_mx).toBe(true);

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains/example.com/verify-auth-domain');
      expect(requests[0].options.method).toBe('POST');
    });
  });

  describe('setupTrackingDomain', () => {
    it('should setup tracking domain successfully', async () => {
      const options = {
        tracking_domain: 'track.example.com',
      };

      mockKyResponse('POST', 'api/domains/example.com/setup-tracklink', {
        status: 201,
        ...createSuccessResponse({
          tracking_domain: 'track.example.com',
        }, { message: 'Tracking domain setup initiated' }),
      });

      const result = await domainsApi.setupTrackingDomain('example.com', options);

      expect(result.success).toBe(true);
      expect(result.data.tracking_domain).toBe('track.example.com');

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains/example.com/setup-tracklink');
      expect(requests[0].options.method).toBe('POST');
      expect(requests[0].options.body).toContain('"tracking_domain":"track.example.com"');
    });
  });

  describe('verifyTrackingDomainRecords', () => {
    it('should verify tracking domain records successfully', async () => {
      mockKyResponse('POST', 'api/domains/example.com/verify-tracklink', {
        status: 200,
        ...createSuccessResponse({
          records: {
            cname: true,
            tracking_domain: 'track.example.com',
          },
        }),
      });

      const result = await domainsApi.verifyTrackingDomainRecords('example.com');

      expect(result.success).toBe(true);
      expect(result.data.records.cname).toBe(true);
      expect(result.data.records.tracking_domain).toBe('track.example.com');

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('api/domains/example.com/verify-tracklink');
      expect(requests[0].options.method).toBe('POST');
    });
  });
});