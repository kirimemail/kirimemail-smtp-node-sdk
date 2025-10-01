import { SmtpClient } from '../client/SmtpClient';
import { Domain } from '../models/Domain';
import { Pagination } from '../models/Pagination';
import { ApiResponse, RequestOptions, CreateDomainOptions, DomainTrackingSettings, AuthDomainSetupOptions, TrackingDomainSetupOptions } from '../types';
import { ApiException } from '../exceptions';

/**
 * API class for managing domains
 */
export class DomainsApi {
  private client: SmtpClient;

  constructor(client: SmtpClient) {
    this.client = client;
  }

  /**
   * List domains for the authenticated user
   *
   * @param params Query parameters (limit, page, search)
   * @returns Promise resolving to domains list with pagination
   * @throws ApiException
   */
  public async listDomains(
    params: {
      limit?: number;
      page?: number;
      search?: string;
    } = {}
  ): Promise<{
    data: Domain[];
    pagination: Pagination;
  }> {
    try {
      const response = await this.client.get('api/domains', params);

      const domains = response.data?.data || [];
      const domainModels = domains.map((domainData: any) => Domain.fromAPI(domainData));

      const pagination = response.pagination ?
        new Pagination(response.pagination) : new Pagination({});

      return {
        data: domainModels,
        pagination,
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to list domains');
    }
  }

  /**
   * Create a new domain
   *
   * @param options Domain creation options
   * @returns Promise resolving to domain creation response
   * @throws ApiException
   */
  public async createDomain(options: CreateDomainOptions): Promise<{
    success: boolean;
    message?: string;
    data: {
      domain: string;
    };
  }> {
    try {
      const response = await this.client.post('api/domains', options);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to create domain');
    }
  }

  /**
   * Get domain details
   *
   * @param domain Domain name
   * @returns Promise resolving to domain details
   * @throws ApiException
   */
  public async getDomain(domain: string): Promise<{
    success: boolean;
    data: Domain;
  }> {
    try {
      const response = await this.client.get(`api/domains/${domain}`);

      return {
        success: true,
        data: Domain.fromAPI(response.data),
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to get domain details');
    }
  }

  /**
   * Update domain configuration
   *
   * @param domain Domain name
   * @param settings Tracking settings to update
   * @returns Promise resolving to updated domain settings
   * @throws ApiException
   */
  public async updateDomain(
    domain: string,
    settings: DomainTrackingSettings
  ): Promise<{
    success: boolean;
    data: DomainTrackingSettings;
  }> {
    try {
      const response = await this.client.put(`api/domains/${domain}`, settings);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to update domain');
    }
  }

  /**
   * Delete a domain
   *
   * @param domain Domain name
   * @returns Promise resolving to deletion response
   * @throws ApiException
   */
  public async deleteDomain(domain: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const response = await this.client.delete(`api/domains/${domain}`);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to delete domain');
    }
  }

  /**
   * Setup authentication domain for a domain
   *
   * @param domain Domain name
   * @param options Authentication domain setup options
   * @returns Promise resolving to auth domain setup response
   * @throws ApiException
   */
  public async setupAuthDomain(
    domain: string,
    options: AuthDomainSetupOptions
  ): Promise<{
    success: boolean;
    data: {
      auth_domain: string;
    };
  }> {
    try {
      const response = await this.client.post(`api/domains/${domain}/setup-auth-domain`, options);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to setup authentication domain');
    }
  }

  /**
   * Verify mandatory DNS records for a domain
   *
   * @param domain Domain name
   * @returns Promise resolving to DNS verification results
   * @throws ApiException
   */
  public async verifyMandatoryRecords(domain: string): Promise<{
    success: boolean;
    data: {
      records: {
        dkim: boolean;
        spf: boolean;
        mx: boolean;
      };
    };
  }> {
    try {
      const response = await this.client.post(`api/domains/${domain}/verify-mandatory`);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to verify mandatory records');
    }
  }

  /**
   * Verify authentication domain DNS records
   *
   * @param domain Domain name
   * @returns Promise resolving to auth domain DNS verification results
   * @throws ApiException
   */
  public async verifyAuthDomainRecords(domain: string): Promise<{
    success: boolean;
    data: {
      records: {
        auth_dkim: boolean;
        auth_spf: boolean;
        auth_mx: boolean;
      };
    };
  }> {
    try {
      const response = await this.client.post(`api/domains/${domain}/verify-auth-domain`);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to verify authentication domain records');
    }
  }

  /**
   * Setup tracking domain for a domain
   *
   * @param domain Domain name
   * @param options Tracking domain setup options
   * @returns Promise resolving to tracking domain setup response
   * @throws ApiException
   */
  public async setupTrackingDomain(
    domain: string,
    options: TrackingDomainSetupOptions
  ): Promise<{
    success: boolean;
    data: {
      tracking_domain: string;
    };
  }> {
    try {
      const response = await this.client.post(`api/domains/${domain}/setup-tracklink`, options);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to setup tracking domain');
    }
  }

  /**
   * Verify tracking domain DNS records
   *
   * @param domain Domain name
   * @returns Promise resolving to tracking domain DNS verification results
   * @throws ApiException
   */
  public async verifyTrackingDomainRecords(domain: string): Promise<{
    success: boolean;
    data: {
      records: {
        cname: boolean;
        tracking_domain: string;
      };
    };
  }> {
    try {
      const response = await this.client.post(`api/domains/${domain}/verify-tracklink`);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to verify tracking domain records');
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