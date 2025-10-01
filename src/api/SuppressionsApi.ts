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
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to get suppressions');
    }
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
  }> {
    try {
      const response = await this.client.get(`api/domains/${domain}/suppressions/unsubscribes`, params);

      const suppressions = response.data?.data || [];
      const suppressionModels = suppressions.map((suppressionData: any) =>
        Suppression.fromAPI(suppressionData)
      );

      const pagination = response.pagination ?
        new Pagination(response.pagination) : new Pagination({});

      return {
        data: suppressionModels,
        pagination,
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to get unsubscribe suppressions');
    }
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
  }> {
    try {
      const response = await this.client.get(`api/domains/${domain}/suppressions/bounces`, params);

      const suppressions = response.data?.data || [];
      const suppressionModels = suppressions.map((suppressionData: any) =>
        Suppression.fromAPI(suppressionData)
      );

      const pagination = response.pagination ?
        new Pagination(response.pagination) : new Pagination({});

      return {
        data: suppressionModels,
        pagination,
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to get bounce suppressions');
    }
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
  }> {
    try {
      const response = await this.client.get(`api/domains/${domain}/suppressions/whitelist`, params);

      const suppressions = response.data?.data || [];
      const suppressionModels = suppressions.map((suppressionData: any) =>
        Suppression.fromAPI(suppressionData)
      );

      const pagination = response.pagination ?
        new Pagination(response.pagination) : new Pagination({});

      return {
        data: suppressionModels,
        pagination,
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to get whitelist suppressions');
    }
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
   * @returns Promise resolving to deletion response
   * @throws ApiException
   */
  public async deleteUnsubscribeSuppressions(
    domain: string,
    ids: number[]
  ): Promise<{
    success: boolean;
    message?: string;
    deleted_count?: number;
  }> {
    try {
      const response = await this.client.delete(`api/domains/${domain}/suppressions/unsubscribes`, {
        ids,
      });
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to delete unsubscribe suppressions');
    }
  }

  /**
   * Delete bounce suppressions by IDs
   *
   * @param domain Domain name
   * @param ids Array of suppression IDs to delete
   * @returns Promise resolving to deletion response
   * @throws ApiException
   */
  public async deleteBounceSuppressions(
    domain: string,
    ids: number[]
  ): Promise<{
    success: boolean;
    message?: string;
    deleted_count?: number;
  }> {
    try {
      const response = await this.client.delete(`api/domains/${domain}/suppressions/bounces`, {
        ids,
      });
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to delete bounce suppressions');
    }
  }

  /**
   * Delete whitelist suppressions by IDs
   *
   * @param domain Domain name
   * @param ids Array of suppression IDs to delete
   * @returns Promise resolving to deletion response
   * @throws ApiException
   */
  public async deleteWhitelistSuppressions(
    domain: string,
    ids: number[]
  ): Promise<{
    success: boolean;
    message?: string;
    deleted_count?: number;
  }> {
    try {
      const response = await this.client.delete(`api/domains/${domain}/suppressions/whitelist`, {
        ids,
      });
      return response;
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