import { SmtpClient } from '../client/SmtpClient';
import { Suppression } from '../models/Suppression';
import { Pagination } from '../models/Pagination';
import { ApiResponse, RequestOptions } from '../types';
import { ApiException } from '../exceptions';

/**
 * API class for managing email suppressions
 */
export class SuppressionsApi {
  private client: SmtpClient;

  constructor(client: SmtpClient) {
    this.client = client;
  }

  /**
   * Get all suppressions for a domain
   *
   * @param domain Domain name
   * @param params Query parameters (limit, page, offset, type, search)
   * @returns Promise resolving to suppressions list with pagination
   * @throws ApiException
   */
  public async getSuppressions(
    domain: string,
    params: {
      limit?: number;
      page?: number;
      offset?: number;
      type?: string;
      search?: string;
    } = {}
  ): Promise<{
    data: Suppression[];
    pagination?: Pagination;
    filters?: Record<string, any>;
  }> {
    try {
      const response = await this.client.get(`api/domains/${domain}/suppressions`, params);

      const suppressions = response.data?.data || [];
      const suppressionModels = suppressions.map((suppressionData: any) =>
        Suppression.fromAPI(suppressionData)
      );

      const pagination = response.pagination ?
        new Pagination(response.pagination) : new Pagination({});

      return {
        data: suppressionModels,
        pagination,
        filters: (response as any).filters,
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to get suppressions');
    }
  }

  /**
   * Search suppressions by recipient email or domain
   *
   * @param domain Domain name
   * @param search Search term (email or domain)
   * @param additionalParams Additional query parameters
   * @returns Promise resolving to suppressions list with pagination
   * @throws ApiException
   */
  public async searchSuppressions(
    domain: string,
    search: string,
    additionalParams: {
      limit?: number;
      page?: number;
      offset?: number;
      type?: string;
    } = {}
  ): Promise<{
    data: Suppression[];
    pagination?: Pagination;
    filters?: Record<string, any>;
  }> {
    return this.getSuppressions(domain, {
      ...additionalParams,
      search,
    });
  }

  /**
   * Get suppressions with pagination
   *
   * @param domain Domain name
   * @param page Page number (default: 1)
   * @param perPage Items per page (default: 10)
   * @param additionalParams Additional query parameters
   * @returns Promise resolving to suppressions list with pagination
   * @throws ApiException
   */
  public async getSuppressionsPaginated(
    domain: string,
    page: number = 1,
    perPage: number = 10,
    additionalParams: {
      offset?: number;
      type?: string;
      search?: string;
    } = {}
  ): Promise<{
    data: Suppression[];
    pagination?: Pagination;
    filters?: Record<string, any>;
  }> {
    return this.getSuppressions(domain, {
      ...additionalParams,
      page,
      limit: perPage,
    });
  }

  /**
   * Get suppressions created after a specific date
   *
   * @param domain Domain name
   * @param startDate Start date
   * @param additionalParams Additional query parameters
   * @returns Promise resolving to suppressions list with pagination
   * @throws ApiException
   */
  public async getSuppressionsCreatedAfter(
    domain: string,
    startDate: Date,
    additionalParams: {
      limit?: number;
      page?: number;
      offset?: number;
      type?: string;
      search?: string;
    } = {}
  ): Promise<{
    data: Suppression[];
    pagination?: Pagination;
    filters?: Record<string, any>;
  }> {
    const allSuppressions = await this.getSuppressions(domain, additionalParams);

    const filteredSuppressions = allSuppressions.data.filter((suppression) => {
      if (suppression.createdAt) {
        const createdDate = suppression.getCreatedDate();
        return createdDate !== null && createdDate >= startDate;
      }
      return true;
    });

    return {
      ...allSuppressions,
      data: filteredSuppressions,
    };
  }

  /**
   * Get suppressions by type
   *
   * @param domain Domain name
   * @param type Suppression type (unsubscribe, bounce, whitelist)
   * @param params Query parameters (limit, page, offset, search)
   * @returns Promise resolving to suppressions list with pagination
   * @throws ApiException
   */
  public async getSuppressionsByType(
    domain: string,
    type: 'unsubscribe' | 'bounce' | 'whitelist',
    params: {
      limit?: number;
      page?: number;
      offset?: number;
      search?: string;
    } = {}
  ): Promise<{
    data: Suppression[];
    pagination?: Pagination;
    filters?: Record<string, any>;
  }> {
    return this.getSuppressions(domain, { ...params, type });
  }

  /**
   * Get unsubscribe suppressions for a domain
   *
   * @param domain Domain name
   * @param params Query parameters (limit, page, offset, search)
   * @returns Promise resolving to unsubscribe suppressions list with pagination
   * @throws ApiException
   */
  public async getUnsubscribeSuppressions(
    domain: string,
    params: {
      limit?: number;
      page?: number;
      offset?: number;
      search?: string;
    } = {}
  ): Promise<{
    data: Suppression[];
    pagination?: Pagination;
    filters?: Record<string, any>;
  }> {
    return this.getSuppressionsByType(domain, 'unsubscribe', params);
  }

  /**
   * Get bounce suppressions for a domain
   *
   * @param domain Domain name
   * @param params Query parameters (limit, page, offset, search)
   * @returns Promise resolving to bounce suppressions list with pagination
   * @throws ApiException
   */
  public async getBounceSuppressions(
    domain: string,
    params: {
      limit?: number;
      page?: number;
      offset?: number;
      search?: string;
    } = {}
  ): Promise<{
    data: Suppression[];
    pagination?: Pagination;
    filters?: Record<string, any>;
  }> {
    return this.getSuppressionsByType(domain, 'bounce', params);
  }

  /**
   * Get whitelist suppressions for a domain
   *
   * @param domain Domain name
   * @param params Query parameters (limit, page, offset, search)
   * @returns Promise resolving to whitelist suppressions list with pagination
   * @throws ApiException
   */
  public async getWhitelistSuppressions(
    domain: string,
    params: {
      limit?: number;
      page?: number;
      offset?: number;
      search?: string;
    } = {}
  ): Promise<{
    data: Suppression[];
    pagination?: Pagination;
    filters?: Record<string, any>;
  }> {
    return this.getSuppressionsByType(domain, 'whitelist', params);
  }

  /**
   * Create a whitelist suppression entry
   *
   * @param domain Domain name
   * @param recipient Email address to whitelist
   * @returns Promise resolving to whitelist creation response
   * @throws ApiException
   */
  public async createWhitelistSuppression(
    domain: string,
    recipient: string
  ): Promise<{
    success: boolean;
    message?: string;
    data: Suppression;
  }> {
    try {
      const response = await this.client.post(`api/domains/${domain}/suppressions/whitelist`, {
        recipient,
      });

      if (response.data) {
        response.data = Suppression.fromAPI(response.data);
      }

      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to create whitelist suppression');
    }
  }

  /**
   * Delete unsubscribe suppressions by IDs
   *
   * @param domain Domain name
   * @param ids Array of suppression IDs to delete
   * @returns Promise resolving when suppressions are deleted
   * @throws ApiException
   */
  public async deleteUnsubscribeSuppressions(
    domain: string,
    ids: number[]
  ): Promise<void> {
    try {
      await this.client.delete(`api/domains/${domain}/suppressions/unsubscribes`, {
        ids,
      });
      return;
    } catch (error) {
      throw this.handleError(error, 'Failed to delete unsubscribe suppressions');
    }
  }

  /**
   * Delete bounce suppressions by IDs
   *
   * @param domain Domain name
   * @param ids Array of suppression IDs to delete
   * @returns Promise resolving when suppressions are deleted
   * @throws ApiException
   */
  public async deleteBounceSuppressions(
    domain: string,
    ids: number[]
  ): Promise<void> {
    try {
      await this.client.delete(`api/domains/${domain}/suppressions/bounces`, {
        ids,
      });
      return;
    } catch (error) {
      throw this.handleError(error, 'Failed to delete bounce suppressions');
    }
  }

  /**
   * Delete whitelist suppressions by IDs
   *
   * @param domain Domain name
   * @param ids Array of suppression IDs to delete
   * @returns Promise resolving when suppressions are deleted
   * @throws ApiException
   */
  public async deleteWhitelistSuppressions(
    domain: string,
    ids: number[]
  ): Promise<void> {
    try {
      await this.client.delete(`api/domains/${domain}/suppressions/whitelist`, {
        ids,
      });
      return;
    } catch (error) {
      throw this.handleError(error, 'Failed to delete whitelist suppressions');
    }
  }

  /**
   * Handle errors and add context
   */
  private handleError(error: any, _defaultMessage: string): never {
    if (error instanceof ApiException) {
      throw error;
    }

    // Re-throw with additional context
    throw new ApiException(`${error.message}`);
  }
}