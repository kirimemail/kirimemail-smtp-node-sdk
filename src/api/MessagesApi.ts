import { SmtpClient } from '../client/SmtpClient';
import { ApiResponse, RequestOptions, EmailMessage, TemplateMessage, FileUpload } from '../types';
import { ApiException } from '../exceptions';

/**
 * API class for sending emails
 */
export class MessagesApi {
  private client: SmtpClient;

  constructor(client: SmtpClient) {
    this.client = client;
  }

/**
 * Send a simple email using regular domain endpoints
 *
 * @param domain Domain name
 * @param message Email message data
 * @returns Promise resolving to send response
 * @throws ApiException
 */
public async sendMessage(
  domain: string,
  message: EmailMessage
): Promise<{
  success: boolean;
  message?: string;
  data?: any;
}> {
  try {
    const response = await this.client.post(`/api/domains/${domain}/message`, message);
    return response;
  } catch (error) {
    throw this.handleError(error, 'Failed to send email');
  }
}

/**
 * Send an email with attachments using regular domain endpoints
 *
 * @param domain Domain name
 * @param message Email message data
 * @param files Array of files to attach
 * @returns Promise resolving to send response
 * @throws ApiException
 */
public async sendMessageWithAttachments(
  domain: string,
  message: EmailMessage,
  files: FileUpload[]
): Promise<{
  success: boolean;
  message?: string;
  data?: any;
}> {
  try {
    const response = await this.client.postMultipart(`/api/domains/${domain}/message`, message, files);
    return response;
  } catch (error) {
    throw this.handleError(error, 'Failed to send email with attachments');
  }
}

/**
 * Send bulk email using regular domain endpoints
 *
 * @param domain Domain name
 * @param message Email message data (to field should be an array)
 * @returns Promise resolving to send response
 * @throws ApiException
 */
public async sendBulkMessage(
  domain: string,
  message: EmailMessage
): Promise<{
  success: boolean;
  message?: string;
  data?: any;
}> {
  try {
    const response = await this.client.post(`/api/domains/${domain}/message`, message);
    return response;
  } catch (error) {
    throw this.handleError(error, 'Failed to send bulk email');
  }
}

/**
 * Send template-based email using regular domain endpoints
 *
 * @param domain Domain name
 * @param template Template message data
 * @returns Promise resolving to send response
 * @throws ApiException
 */
public async sendTemplateMessage(
  domain: string,
  template: TemplateMessage
): Promise<{
  success: boolean;
  message?: string;
  data?: any;
}> {
  try {
    const response = await this.client.post(`/api/domains/${domain}/message/template`, template);
    return response;
  } catch (error) {
    throw this.handleError(error, 'Failed to send template email');
  }
}

  /**
   * Validate email message data before sending
   *
   * @param message Email message data to validate
   * @returns Promise resolving to validation response
   * @throws ApiException
   */
  public async validateMessage(message: EmailMessage): Promise<{
    valid: boolean;
    errors?: string[];
  }> {
    // Basic client-side validation
    const errors: string[] = [];

    if (!message.from) {
      errors.push('From address is required');
    }

    if (!message.to) {
      errors.push('To address is required');
    }

    if (!message.subject) {
      errors.push('Subject is required');
    }

    if (!message.text && !message.html) {
      errors.push('Either text or HTML content is required');
    }

    // Return client-side validation result
    if (errors.length > 0) {
      return {
        valid: false,
        errors,
      };
    }

    // If passes client-side validation, we could potentially validate on the server
    // but this would depend on the API having a validation endpoint
    return {
      valid: true,
    };
  }

  /**
   * Create a file upload object for attachments
   *
   * @param field Form field name
   * @param filename Original filename
   * @param content File content (Buffer or string)
   * @param contentType Optional MIME type
   * @returns FileUpload object
   */
  public createFileUpload(
    field: string,
    filename: string,
    content: Buffer | string,
    contentType?: string
  ): FileUpload {
    return {
      field,
      filename,
      content,
      contentType,
    };
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