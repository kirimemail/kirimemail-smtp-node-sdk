// Mock the SmtpClient module completely before any imports
jest.mock('../../src/client/SmtpClient', () => ({
  SmtpClient: jest.fn(),
}), { virtual: true });

// Import after mocking
import { MessagesApi } from '../../src/api/MessagesApi';
import { createMockKy, mockKyResponse, createSuccessResponse, resetMockKy, getMockRequests } from '../utils/mockKy';

describe('MessagesApi', () => {
  let messagesApi: MessagesApi;
  let mockKy: any;

  beforeEach(() => {
    jest.clearAllMocks();
    resetMockKy();

    const mockKyImpl = createMockKy();
    
    // Create a mock client that uses the ky instance internally
    const mockClient = {
      // The ky instance that makeRequest will use
      ...mockKyImpl,
      // Override the HTTP methods to call makeRequest like the real SmtpClient
      get: jest.fn().mockImplementation((url: string, params?: any, options?: any) => {
        return mockClient.makeRequest('GET', url, { searchParams: params, headers: options?.headers });
      }),
      post: jest.fn().mockImplementation((url: string, data?: any, options?: any) => {
        return mockClient.makeRequest('POST', url, { json: data, headers: options?.headers });
      }),
      put: jest.fn().mockImplementation((url: string, data?: any, options?: any) => {
        return mockClient.makeRequest('PUT', url, { json: data, headers: options?.headers });
      }),
      delete: jest.fn().mockImplementation((url: string, params?: any, options?: any) => {
        return mockClient.makeRequest('DELETE', url, { searchParams: params, headers: options?.headers });
      }),
      postMultipart: jest.fn().mockImplementation((url: string, data?: any, files?: any, options?: any) => {
        return mockClient.makeRequest('POST', url, { body: data, headers: options?.headers });
      }),
      // Add the makeRequest method
      makeRequest: jest.fn().mockImplementation(async (method: string, endpoint: string, options: any) => {
        // Call the ky instance as a function like the real SmtpClient
        const response = await mockKyImpl(endpoint, { ...options, method });
        
        // Handle the response like the real SmtpClient
        if (response.ok) {
          return await response.json();
        } else {
          throw new Error(`Unexpected status code: ${response.status}`);
        }
      }),
    };

    const mockSmtpClient = require('../../src/client/SmtpClient').SmtpClient;
    mockSmtpClient.mockImplementation(() => mockClient);

    messagesApi = new MessagesApi(mockClient as any);
    mockKy = mockKyImpl;
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      const message = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Email',
        text: 'This is a test email',
      };

      mockKyResponse('POST', 'api/domains/example.com/message', {
        status: 200,
        json: createSuccessResponse({
          message_id: 'msg-123',
          status: 'sent',
        }, { message: 'Email sent successfully' }).json,
      });

      const result = await messagesApi.sendMessage('example.com', message);

      expect(result.success).toBe(true);
      expect(result.data.message_id).toBe('msg-123');
      expect(result.data.status).toBe('sent');
      expect(result.message).toBe('Email sent successfully');

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('/api/domains/example.com/message');
      expect(requests[0].options.method).toBe('POST');
      expect(requests[0].options.body).toContain('"from":"sender@example.com"');
      expect(requests[0].options.body).toContain('"to":"recipient@example.com"');
    });

    it('should handle send error', async () => {
      const message = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Email',
        text: 'This is a test email',
      };

      mockKyResponse('POST', 'api/domains/example.com/message', {
        status: 400,
        text: 'Invalid sender address',
      });

      await expect(messagesApi.sendMessage('example.com', message)).rejects.toThrow('Invalid sender address');
    });
  });

  describe('sendMessageWithAttachments', () => {
    it('should send message with attachments successfully', async () => {
      const message = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Email with Attachments',
        text: 'This is a test email with attachments',
      };

      const files = [
        messagesApi.createFileUpload('attachment', 'test.txt', 'This is test content', 'text/plain'),
        messagesApi.createFileUpload('attachment', 'test.pdf', Buffer.from('pdf content'), 'application/pdf'),
      ];

      mockKyResponse('POST', 'api/domains/example.com/message', {
        status: 200,
        json: createSuccessResponse({
          message_id: 'msg-456',
          status: 'sent',
          attachments: 2,
        }, { message: 'Email with attachments sent successfully' }).json,
      });

      const result = await messagesApi.sendMessageWithAttachments('example.com', message, files);

      expect(result.success).toBe(true);
      expect(result.data.message_id).toBe('msg-456');
      expect(result.data.attachments).toBe(2);
      expect(result.message).toBe('Email with attachments sent successfully');

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('/api/domains/example.com/message');
      expect(requests[0].options.method).toBe('POST');
    });

    it('should handle attachment upload error', async () => {
      const message = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Email',
        text: 'This is a test email',
      };

      const files = [
        messagesApi.createFileUpload('attachment', 'large.txt', 'x'.repeat(11 * 1024 * 1024)), // 11MB
      ];

      mockKyResponse('POST', 'api/domains/example.com/message', {
        status: 413,
        text: 'File too large',
      });

      await expect(messagesApi.sendMessageWithAttachments('example.com', message, files))
        .rejects.toThrow('File too large');
    });
  });

  describe('sendBulkMessage', () => {
    it('should send bulk message successfully', async () => {
      const message = {
        from: 'sender@example.com',
        to: ['recipient1@example.com', 'recipient2@example.com', 'recipient3@example.com'],
        subject: 'Bulk Test Email',
        text: 'This is a bulk test email',
      };

      mockKyResponse('POST', 'api/domains/example.com/message', {
        status: 200,
        json: createSuccessResponse({
          message_id: 'bulk-msg-789',
          status: 'sent',
          recipient_count: 3,
        }, { message: 'Bulk email sent successfully' }).json,
      });

      const result = await messagesApi.sendBulkMessage('example.com', message);

      expect(result.success).toBe(true);
      expect(result.data.message_id).toBe('bulk-msg-789');
      expect(result.data.recipient_count).toBe(3);
      expect(result.message).toBe('Bulk email sent successfully');

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('/api/domains/example.com/message');
      expect(requests[0].options.method).toBe('POST');
      expect(requests[0].options.body).toContain('"to":["recipient1@example.com","recipient2@example.com","recipient3@example.com"]');
    });

    it('should handle bulk send error', async () => {
      const message = {
        from: 'sender@example.com',
        to: ['recipient1@example.com'],
        subject: 'Bulk Test Email',
        text: 'This is a bulk test email',
      };

      mockKyResponse('POST', 'api/domains/example.com/message', {
        status: 422,
        text: 'Invalid recipient format',
      });

      await expect(messagesApi.sendBulkMessage('example.com', message))
        .rejects.toThrow('Invalid recipient format');
    });
  });

  describe('sendTemplateMessage', () => {
    it('should send template message successfully', async () => {
      const template = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        template_guid: 'welcome_template',
        template_data: {
          name: 'John Doe',
          company: 'Acme Corp',
        },
      };

      mockKyResponse('POST', 'api/domains/example.com/message/template', {
        status: 200,
        json: createSuccessResponse({
          message_id: 'template-msg-999',
          status: 'sent',
          template_id: 'welcome-template',
        }, { message: 'Template email sent successfully' }).json,
      });

      const result = await messagesApi.sendTemplateMessage('example.com', template);

      expect(result.success).toBe(true);
      expect(result.data.message_id).toBe('template-msg-999');
      expect(result.data.template_id).toBe('welcome-template');
      expect(result.data.status).toBe('sent');
      expect(result.message).toBe('Template email sent successfully');

      const requests = getMockRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('/api/domains/example.com/message/template');
      expect(requests[0].options.method).toBe('POST');
      expect(requests[0].options.body).toContain('"template_guid":"welcome_template"');
      expect(requests[0].options.body).toContain('"name":"John Doe"');
    });

    it('should handle template send error', async () => {
      const template = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        template_guid: 'nonexistent_template',
        template_data: {},
      };

      mockKyResponse('POST', 'api/domains/example.com/message/template', {
        status: 404,
        text: 'Template not found',
      });

      await expect(messagesApi.sendTemplateMessage('example.com', template))
        .rejects.toThrow('Template not found');
    });
  });

  describe('validateMessage', () => {
    it('should validate valid message successfully', async () => {
      const message = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Email',
        text: 'This is a test email',
      };

      const result = await messagesApi.validateMessage(message);

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should detect missing from address', async () => {
      const message = {
        from: '',
        to: 'recipient@example.com',
        subject: 'Test Email',
        text: 'This is a test email',
      };

      const result = await messagesApi.validateMessage(message);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('From address is required');
    });

    it('should detect missing to address', async () => {
      const message = {
        from: 'sender@example.com',
        to: '',
        subject: 'Test Email',
        text: 'This is a test email',
      };

      const result = await messagesApi.validateMessage(message);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('To address is required');
    });

    it('should detect missing subject', async () => {
      const message = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: '',
        text: 'This is a test email',
      };

      const result = await messagesApi.validateMessage(message);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Subject is required');
    });

    it('should detect missing both text and html content', async () => {
      const message = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Email',
        text: '',
        html: '',
      };

      const result = await messagesApi.validateMessage(message);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Either text or HTML content is required');
    });

    it('should detect multiple validation errors', async () => {
      const message = {
        from: '',
        to: '',
        subject: '',
        text: '',
      };

      const result = await messagesApi.validateMessage(message);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(4);
      expect(result.errors).toContain('From address is required');
      expect(result.errors).toContain('To address is required');
      expect(result.errors).toContain('Subject is required');
      expect(result.errors).toContain('Either text or HTML content is required');
    });

    it('should accept message with html content only', async () => {
      const message = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Email',
        html: '<p>This is a test email</p>',
      };

      const result = await messagesApi.validateMessage(message);

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should accept message with both text and html content', async () => {
      const message = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Email',
        text: 'This is a test email',
        html: '<p>This is a test email</p>',
      };

      const result = await messagesApi.validateMessage(message);

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });
  });

  describe('createFileUpload', () => {
    it('should create file upload with string content', () => {
      const fileUpload = messagesApi.createFileUpload(
        'attachment',
        'test.txt',
        'This is test content',
        'text/plain'
      );

      expect(fileUpload.field).toBe('attachment');
      expect(fileUpload.filename).toBe('test.txt');
      expect(fileUpload.content).toBe('This is test content');
      expect(fileUpload.contentType).toBe('text/plain');
    });

    it('should create file upload with Buffer content', () => {
      const bufferContent = Buffer.from('binary content');
      const fileUpload = messagesApi.createFileUpload(
        'attachment',
        'binary.bin',
        bufferContent,
        'application/octet-stream'
      );

      expect(fileUpload.field).toBe('attachment');
      expect(fileUpload.filename).toBe('binary.bin');
      expect(fileUpload.content).toBe(bufferContent);
      expect(fileUpload.contentType).toBe('application/octet-stream');
    });

    it('should create file upload without content type', () => {
      const fileUpload = messagesApi.createFileUpload(
        'attachment',
        'unknown.txt',
        'content'
      );

      expect(fileUpload.field).toBe('attachment');
      expect(fileUpload.filename).toBe('unknown.txt');
      expect(fileUpload.content).toBe('content');
      expect(fileUpload.contentType).toBeUndefined();
    });
  });
});