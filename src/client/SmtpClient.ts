import ky, { KyInstance, Options } from 'ky';
import {
  ApiException,
  AuthenticationException,
  ValidationException,
  NotFoundException,
  ServerException,
} from '../exceptions';
import {
  BasicAuthCredentials,
  RequestOptions,
  ApiResponse,
  FileUpload,
} from '../types';

/**
 * HTTP client for the Kirim.Email SMTP API
 */
export class SmtpClient {
  private kyInstance: KyInstance;
  private basicAuth?: BasicAuthCredentials;
  private baseUrl: string;

  /**
   * Create a new SMTP client instance
   *
   * @param username - Username for basic authentication
   * @param token - Token for basic authentication
   * @param baseUrl - Base URL for the API
   */
  constructor(
    username?: string,
    token?: string,
    baseUrl: string = 'https://smtp-app.kirim.email'
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '');

    // Set up authentication
    if (username && token) {
      this.basicAuth = { username, token };
    }

    // Initialize ky instance
    this.kyInstance = ky.create({
      prefixUrl: this.baseUrl,
      timeout: 30000,
      retry: {
        limit: 3,
        methods: ['get', 'put', 'delete', 'head', 'trace', 'options'],
        statusCodes: [408, 413, 429, 500, 502, 503, 504],
      },
      headers: {
        'User-Agent': '@kirimemail/smtp-sdk/1.0.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Make a GET request
   */
  public async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const searchParams = params ? new URLSearchParams(params) : undefined;

    const kyOptions: Options = {
      searchParams,
      headers: options?.headers,
      timeout: options?.timeout,
      retry: options?.retries,
    };

    return this.makeRequest('GET', endpoint, kyOptions);
  }

  /**
   * Make a POST request
   */
  public async post<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const kyOptions: Options = {
      json: data,
      headers: options?.headers,
      timeout: options?.timeout,
      retry: options?.retries,
    };

    return this.makeRequest('POST', endpoint, kyOptions);
  }

  /**
   * Make a POST request with multipart form data
   */
  public async postMultipart<T = any>(
    endpoint: string,
    data?: Record<string, any>,
    files?: FileUpload[],
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();

    // Add regular form fields
    if (data) {
      for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            formData.append(`${key}[]`, String(item));
          });
        } else {
          formData.append(key, String(value));
        }
      }
    }

    // Add files
    if (files) {
      for (const file of files) {
        const blob = typeof file.content === 'string'
          ? new Blob([file.content], { type: file.contentType || 'text/plain' })
          : new Blob([file.content], { type: file.contentType || 'application/octet-stream' });

        formData.append(file.field, blob, file.filename);
      }
    }

    const kyOptions: Options = {
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let the browser set it with boundary
        ...options?.headers,
      },
      timeout: options?.timeout,
      retry: options?.retries,
    };

    return this.makeRequest('POST', endpoint, kyOptions);
  }

  /**
   * Make a PUT request
   */
  public async put<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const kyOptions: Options = {
      json: data,
      headers: options?.headers,
      timeout: options?.timeout,
      retry: options?.retries,
    };

    return this.makeRequest('PUT', endpoint, kyOptions);
  }

  /**
   * Make a DELETE request
   */
  public async delete<T = any>(
    endpoint: string,
    data?: Record<string, any>,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const kyOptions: Options = {
      json: data,
      headers: options?.headers,
      timeout: options?.timeout,
      retry: options?.retries,
    };

    return this.makeRequest('DELETE', endpoint, kyOptions);
  }

  /**
   * Stream response data (for log streaming)
   */
  public async *stream<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    options?: RequestOptions
  ): AsyncGenerator<T> {
    const searchParams = params ? new URLSearchParams(params) : undefined;

    const kyOptions: Options = {
      searchParams,
      headers: options?.headers,
      timeout: options?.timeout || 60000, // Longer timeout for streaming
    };

    const authenticatedOptions = this.addAuthentication(kyOptions, endpoint);

    try {
      const response = await this.kyInstance.get(endpoint, authenticatedOptions);

      if (!response.body) {
        throw new ApiException('Response body is empty');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim()) {
            // Handle Server-Sent Events format
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data !== '[DONE]') {
                try {
                  const parsed = JSON.parse(data);
                  yield parsed;
                } catch (error) {
                  // Skip invalid JSON lines
                  continue;
                }
              }
            } else {
              // Try to parse as JSON directly
              try {
                const parsed = JSON.parse(line);
                yield parsed;
              } catch (error) {
                // Skip invalid JSON lines
                continue;
              }
            }
          }
        }
      }
    } catch (error) {
      this.handleError(error, endpoint);
    }
  }

  /**
   * Make an HTTP request with authentication
   */
  private async makeRequest<T = any>(
    method: string,
    endpoint: string,
    options: Options
  ): Promise<ApiResponse<T>> {
    const authenticatedOptions = this.addAuthentication(options, endpoint);

    try {
      const response = await this.kyInstance(endpoint, {
        ...authenticatedOptions,
        method,
      });

      const data = await response.json() as ApiResponse<T>;

      // Handle success responses
      if (response.ok) {
        return data;
      }

      // Handle error responses (shouldn't happen with ky's retry logic)
      throw new ApiException(`Unexpected status code: ${response.status}`, response.status);

    } catch (error) {
      this.handleError(error, endpoint);
    }
  }

  /**
   * Add authentication headers to the request
   */
  private addAuthentication(options: Options, endpoint: string): Options {
    const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };

    // Use Basic Auth for all endpoints
    if (this.basicAuth) {
      const authString = `${this.basicAuth.username}:${this.basicAuth.token}`;
      headers['Authorization'] = `Basic ${Buffer.from(authString).toString('base64')}`;
    }

    return { ...options, headers };
  }

  /**
   * Extract domain name from endpoint path
   */
  private extractDomainFromEndpoint(endpoint: string): string | null {
    const match = endpoint.match(/\/api\/domains\/([^\/]+)/);
    return match ? match[1] : null;
  }

  /**
   * Handle HTTP errors and throw appropriate exceptions
   */
  private handleError(error: any, endpoint: string): never {
    if (error.name === 'HTTPError') {
      const status = error.response.status;

      // Try to parse error response
      let errorData: any = {};
      try {
        errorData = error.response.json();
      } catch {
        // If we can't parse JSON, use status text
        errorData = { message: error.response.statusText };
      }

      const message = errorData.message || errorData.error || 'Unknown API error';

      switch (status) {
        case 400:
        case 422:
          throw new ValidationException(message, errorData.errors);
        case 401:
        case 403:
          throw new AuthenticationException(message);
        case 404:
          throw new NotFoundException(message);
        default:
          if (status >= 500) {
            throw new ServerException(message);
          }
          throw new ApiException(message, status);
      }
    }

    if (error.name === 'TimeoutError') {
      throw new ApiException('Request timeout');
    }

    if (error.name === 'NetworkError') {
      throw new ApiException('Network error');
    }

    // Re-throw our custom exceptions
    if (
      error instanceof ApiException ||
      error instanceof AuthenticationException ||
      error instanceof ValidationException ||
      error instanceof NotFoundException ||
      error instanceof ServerException
    ) {
      throw error;
    }

    // Unknown error
    throw new ApiException(`Unexpected error: ${error.message}`);
  }

  /**
   * Set the base URL for the API
   */
  public setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.kyInstance = ky.create({
      prefixUrl: this.baseUrl,
      timeout: 30000,
      retry: {
        limit: 3,
        methods: ['get', 'put', 'delete', 'head', 'trace', 'options'],
        statusCodes: [408, 413, 429, 500, 502, 503, 504],
      },
      headers: {
        'User-Agent': '@kirimemail/smtp-sdk/1.0.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get the current base URL
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Update basic authentication credentials
   */
  public setBasicAuth(username: string, token: string): void {
    this.basicAuth = { username, token };
  }

  /**
   * Check if basic authentication is configured
   */
  public hasBasicAuth(): boolean {
    return !!this.basicAuth;
  }
}