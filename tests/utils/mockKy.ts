/**
 * Mock utilities for ky HTTP client
 */

// Mock data structures
export interface MockResponse {
  json?: any;
  text?: string;
  status: number;
  headers?: Record<string, string>;
}

export interface MockOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

// Store mock responses
const mockResponses = new Map<string, MockResponse>();
const mockRequests: Array<{ url: string; options: MockOptions }> = [];

// Mock ky client creator
export const createMockKy = () => {
  const mockInstance = jest.fn().mockImplementation((url: string, options?: any) => {
    const method = options?.method || 'GET';
    mockRequests.push({ url, options: { method: method.toUpperCase(), headers: options?.headers, body: JSON.stringify(options?.json) } });
    return mockRequest(url, method, options);
  }) as any;

  // Add individual methods as well
  mockInstance.get = jest.fn().mockImplementation((url: string, options?: any) => {
    mockRequests.push({ url, options: { method: 'GET', headers: options?.headers } });
    return mockRequest(url, 'GET', options);
  });
  mockInstance.post = jest.fn().mockImplementation((url: string, options?: any) => {
    mockRequests.push({ url, options: { method: 'POST', headers: options?.headers, body: JSON.stringify(options?.json) } });
    return mockRequest(url, 'POST', options);
  });
  mockInstance.put = jest.fn().mockImplementation((url: string, options?: any) => {
    mockRequests.push({ url, options: { method: 'PUT', headers: options?.headers, body: JSON.stringify(options?.json) } });
    return mockRequest(url, 'PUT', options);
  });
  mockInstance.delete = jest.fn().mockImplementation((url: string, options?: any) => {
    mockRequests.push({ url, options: { method: 'DELETE', headers: options?.headers, body: JSON.stringify(options?.json) } });
    return mockRequest(url, 'DELETE', options);
  });
  mockInstance.extend = (options: any) => createMockKy();

  return mockInstance;
};

// Mock request handler
async function mockRequest(url: string, method: string, options?: any): Promise<any> {
  const normalizedMethod = method.toUpperCase();
  const normalizedUrl = url.startsWith('/') ? url.substring(1) : url;
  const key = `${normalizedMethod}:${normalizedUrl}`;
  let mockResponse = mockResponses.get(key);

  // Try with leading slash if not found
  if (!mockResponse) {
    const fallbackKey = `${normalizedMethod}:/${normalizedUrl}`;
    mockResponse = mockResponses.get(fallbackKey);
  }

  if (!mockResponse) {
    throw new Error(`No mock response configured for ${normalizedMethod} ${url}`);
  }

  if (mockResponse.status >= 400) {
    const error = new Error(mockResponse.text || 'Request failed');
    (error as any).response = {
      status: mockResponse.status,
      headers: mockResponse.headers || {},
      json: async () => mockResponse.json,
    };
    throw error;
  }

  // Return a proper response object with json() method to simulate ky response
  return {
    json: async () => mockResponse.json || mockResponse.text,
    ok: mockResponse.status < 400,
    status: mockResponse.status,
  };
}

// Helper to set up mock responses
export const mockKyResponse = (method: string, url: string, response: MockResponse) => {
  const normalizedMethod = method.toUpperCase();
  const normalizedUrl = url.startsWith('/') ? url.substring(1) : url;
  const key = `${normalizedMethod}:${normalizedUrl}`;
  mockResponses.set(key, response);
};

// Helper to create common API responses
export const createSuccessResponse = (data: any, additional?: any) => ({
  json: {
    success: true,
    data,
    ...additional,
  },
});

export const createPaginatedResponse = (data: any[], pagination: any, additional?: any) => ({
  json: {
    success: true,
    data: {
      data,
      pagination,
    },
    pagination,
    ...additional,
  },
});

export const createErrorResponse = (status: number, message: string, errors?: any) => ({
  status,
  text: message,
  json: {
    success: false,
    message,
    errors,
  },
});

// Helper to reset mocks
export const resetMockKy = () => {
  mockResponses.clear();
  mockRequests.length = 0;
};

// Helper to get recorded requests
export const getMockRequests = () => [...mockRequests];

// Helper to find specific request
export const findMockRequest = (method: string, url: string) => {
  return mockRequests.find(req =>
    req.url === url && req.options.method === method.toUpperCase()
  );
};