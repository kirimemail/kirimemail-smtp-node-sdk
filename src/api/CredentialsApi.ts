import { SmtpClient } from '../client/SmtpClient';
import { Credential } from '../models/Credential';
import { Pagination } from '../models/Pagination';
import { ApiResponse, RequestOptions } from '../types';
import { ApiException } from '../exceptions';

/**
 * API class for managing SMTP credentials
 */
export class CredentialsApi {
  private client: SmtpClient;

  constructor(client: SmtpClient) {
    this.client = client;
  }

  /**
   * List domain credentials
   *
   * @param domain Domain name
   * @param params Query parameters (limit, page)
   * @returns Promise resolving to credentials list with pagination
   * @throws ApiException
   */
  public async listCredentials(
    domain: string,
    params: {
      limit?: number;
      page?: number;
    } = {}
  ): Promise<{
    data: Credential[];
    domain: string;
    pagination?: Pagination;
  }> {
    try {
      const response = await this.client.get(`api/domains/${domain}/credentials`, params);

      // Handle nested data structure for list response
      const credentialList = response.data?.data || response.data || [];
      const credentials = credentialList.map((credentialData: any) =>
        Credential.fromAPI(credentialData)
      );

      const pagination = response.data?.pagination ?
        new Pagination(response.data.pagination) : undefined;

      return {
        data: credentials,
        domain: response.domain || domain,
        pagination,
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to list credentials');
    }
  }

  /**
   * Create a new credential
   *
   * @param domain Domain name
   * @param username SMTP username
   * @returns Promise resolving to created credential with generated password
   * @throws ApiException
   */
  public async createCredential(
    domain: string,
    username: string
  ): Promise<{
    success: boolean;
    message?: string;
    data: {
      credential: Credential;
      password: string;
      remote_synced: boolean;
    };
  }> {
    try {
      const response = await this.client.post(`api/domains/${domain}/credentials`, {
        username,
      });

      // Transform credential data to model and flatten password fields
      if (response.data?.credential) {
        const credential = Credential.fromAPI(response.data.credential);

        // Add password and remote_synced to the credential model
        if (response.data.password) {
          credential.setPassword(response.data.password);
        }
        if (response.data.remote_synced !== undefined) {
          credential.setRemoteSynced(response.data.remote_synced);
        }

        response.data.credential = credential;
      }

      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to create credential');
    }
  }

  /**
   * Get credential details
   *
   * @param domain Domain name
   * @param credentialId Credential ID or GUID
   * @returns Promise resolving to credential details
   * @throws ApiException
   */
  public async getCredential(
    domain: string,
    credentialId: string
  ): Promise<{
    success: boolean;
    data: Credential;
  }> {
    try {
      const response = await this.client.get(`api/domains/${domain}/credentials/${credentialId}`);

      return {
        success: true,
        data: Credential.fromAPI(response.data),
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to get credential');
    }
  }

  /**
   * Delete a credential
   *
   * @param domain Domain name
   * @param credentialId Credential ID or GUID
   * @returns Promise resolving to deletion response
   * @throws ApiException
   */
  public async deleteCredential(
    domain: string,
    credentialId: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const response = await this.client.delete(`api/domains/${domain}/credentials/${credentialId}`);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to delete credential');
    }
  }

  /**
   * Reset credential password
   *
   * @param domain Domain name
   * @param credentialId Credential ID or GUID
   * @returns Promise resolving to password reset response with new password
   * @throws ApiException
   */
  public async resetPassword(
    domain: string,
    credentialId: string
  ): Promise<{
    success: boolean;
    message?: string;
    data: {
      credential: Credential;
      new_password: string;
      strength_info: Record<string, any>;
      remote_synced: boolean;
    };
  }> {
    try {
      const response = await this.client.put(`api/domains/${domain}/credentials/${credentialId}/reset-password`);

      // Transform credential data to model and flatten password fields
      if (response.data?.credential) {
        const credential = Credential.fromAPI(response.data.credential);

        // Add new_password to password property for consistency, plus other fields
        if (response.data.new_password) {
          credential.setPassword(response.data.new_password);
        }
        if (response.data.strength_info) {
          credential.setStrengthInfo(response.data.strength_info);
        }
        if (response.data.remote_synced !== undefined) {
          credential.setRemoteSynced(response.data.remote_synced);
        }

        response.data.credential = credential;
      }

      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to reset password');
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