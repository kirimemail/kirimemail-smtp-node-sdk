import { SmtpClient } from '../client/SmtpClient';
import { EmailValidationResult } from '../models/EmailValidationResult';
import { ApiResponse, EmailValidationOptions, BulkEmailValidationOptions } from '../types';
import { ApiException } from '../exceptions';

export class EmailValidationApi {
  private client: SmtpClient;

  constructor(client: SmtpClient) {
    this.client = client;
  }

  public async validateEmail(
    email: string
  ): Promise<{
    success: boolean;
    data: EmailValidationResult;
  }> {
    try {
      const response = await this.client.post('api/email/validate', {
        email,
      });

      if (response.data) {
        response.data = EmailValidationResult.fromAPI(response.data);
      }

      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to validate email');
    }
  }

  public async validateEmailStrict(
    email: string
  ): Promise<{
    success: boolean;
    data: EmailValidationResult;
  }> {
    try {
      const response = await this.client.post('api/email/validate/strict', {
        email,
      });

      if (response.data) {
        response.data = EmailValidationResult.fromAPI(response.data);
      }

      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to validate email with strict mode');
    }
  }

  public async validateEmailBulk(
    emails: string[]
  ): Promise<{
    success: boolean;
    data: {
      results: EmailValidationResult[];
      summary: {
        total: number;
        valid: number;
        invalid: number;
        cached: number;
        validated: number;
      };
    };
  }> {
    try {
      const response = await this.client.post('api/email/validate/bulk', {
        emails,
      });

      if (response.data?.results) {
        response.data.results = response.data.results.map((resultData: any) =>
          EmailValidationResult.fromAPI(resultData)
        );
      }

      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to validate emails in bulk');
    }
  }

  public async validateEmailBulkStrict(
    emails: string[]
  ): Promise<{
    success: boolean;
    data: {
      results: EmailValidationResult[];
      summary: {
        total: number;
        valid: number;
        invalid: number;
        cached: number;
        validated: number;
      };
    };
  }> {
    try {
      const response = await this.client.post('api/email/validate/bulk/strict', {
        emails,
      });

      if (response.data?.results) {
        response.data.results = response.data.results.map((resultData: any) =>
          EmailValidationResult.fromAPI(resultData)
        );
      }

      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to validate emails in bulk with strict mode');
    }
  }

  private handleError(error: any, _defaultMessage: string): never {
    if (error instanceof ApiException) {
      throw error;
    }

    throw new ApiException(`${error.message}`);
  }
}
