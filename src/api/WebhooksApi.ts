import { SmtpClient } from '../client/SmtpClient';
import { Webhook } from '../models/Webhook';
import { ApiResponse, WebhookOptions, WebhookUpdateOptions } from '../types';
import { ApiException } from '../exceptions';

export class WebhooksApi {
  private client: SmtpClient;

  constructor(client: SmtpClient) {
    this.client = client;
  }

  public async listWebhooks(
    domain: string,
    params: {
      type?: string;
    } = {}
  ): Promise<{
    success: boolean;
    data: Webhook[];
    count?: number;
  }> {
    try {
      const response = await this.client.get(`api/domains/${domain}/webhooks`, params);

      const webhooks = response.data?.data || [];
      const webhookModels = webhooks.map((webhookData: any) =>
        Webhook.fromAPI(webhookData)
      );

      return {
        success: response.success,
        data: webhookModels,
        count: response.count,
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to list webhooks');
    }
  }

  public async createWebhook(
    domain: string,
    options: WebhookOptions
  ): Promise<{
    success: boolean;
    message?: string;
    data: Webhook;
  }> {
    try {
      const response = await this.client.post(`api/domains/${domain}/webhooks`, options);

      if (response.data) {
        response.data = Webhook.fromAPI(response.data);
      }

      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to create webhook');
    }
  }

  public async getWebhook(
    domain: string,
    webhookGuid: string
  ): Promise<{
    success: boolean;
    data: Webhook;
  }> {
    try {
      const response = await this.client.get(`api/domains/${domain}/webhooks/${webhookGuid}`);

      if (response.data) {
        response.data = Webhook.fromAPI(response.data);
      }

      return {
        success: true,
        data: Webhook.fromAPI(response.data),
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to get webhook');
    }
  }

  public async updateWebhook(
    domain: string,
    webhookGuid: string,
    options: WebhookUpdateOptions
  ): Promise<{
    success: boolean;
    message?: string;
    data: Webhook;
  }> {
    try {
      const response = await this.client.put(`api/domains/${domain}/webhooks/${webhookGuid}`, options);

      if (response.data) {
        response.data = Webhook.fromAPI(response.data);
      }

      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to update webhook');
    }
  }

  public async deleteWebhook(
    domain: string,
    webhookGuid: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const response = await this.client.delete(`api/domains/${domain}/webhooks/${webhookGuid}`);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to delete webhook');
    }
  }

  public async testWebhook(
    domain: string,
    webhookGuid: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const response = await this.client.post(`api/domains/${domain}/webhooks/test`, {
        webhook_guid: webhookGuid,
      });
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to test webhook');
    }
  }

  private handleError(error: any, _defaultMessage: string): never {
    if (error instanceof ApiException) {
      throw error;
    }

    throw new ApiException(`${error.message}`);
  }
}
