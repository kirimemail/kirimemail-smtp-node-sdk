import { SmtpClient } from '../client/SmtpClient';
import { Quota } from '../models/Quota';
import { ApiResponse } from '../types';
import { ApiException } from '../exceptions';

export class UserApi {
  private client: SmtpClient;

  constructor(client: SmtpClient) {
    this.client = client;
  }

  public async getQuota(): Promise<{
    success: boolean;
    data: Quota;
  }> {
    try {
      const response = await this.client.get('api/quota');

      if (response.data) {
        response.data = Quota.fromAPI(response.data);
      }

      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to get user quota');
    }
  }

  private handleError(error: any, _defaultMessage: string): never {
    if (error instanceof ApiException) {
      throw error;
    }

    throw new ApiException(`${error.message}`);
  }
}
