# @kirimemail/smtp-sdk

Node.js SDK for Kirim.Email SMTP API - A modern, fully-featured TypeScript SDK for managing SMTP credentials, domains, email sending, logs, and suppressions.

## Features

- 🚀 **Modern JavaScript/TypeScript** with full type support
- 🔐 **Simple Authentication** - Basic Auth for all endpoints
- 📦 **Lightweight** - Only depends on `ky` HTTP client
- 🔄 **Async/Await** - Modern promise-based API
- 🛡️ **Error Handling** - Comprehensive exception classes
- 📖 **Well Documented** - Full JSDoc documentation
- 🧪 **Tested** - Built with testing in mind
- 📧 **Complete API Coverage** - All 5 API classes implemented

## Installation

```bash
npm install @kirimemail/smtp-sdk
```

## Quick Start

### Basic Authentication

The SDK uses Basic Authentication for all endpoints:

```javascript
const { SmtpClient, CredentialsApi, DomainsApi } = require('@kirimemail/smtp-sdk');

// Initialize client with basic authentication
const client = new SmtpClient('your_username', 'your_token');
const credentialsApi = new CredentialsApi(client);
const domainsApi = new DomainsApi(client);

// List domains
const domains = await domainsApi.listDomains();
console.log(`Found ${domains.data.length} domains`);

// List credentials for a domain
const credentials = await credentialsApi.listCredentials('example.com');
console.log(`Found ${credentials.data.length} credentials`);
```

## TypeScript Usage

```typescript
import {
  SmtpClient,
  CredentialsApi,
  DomainsApi,
  MessagesApi,
  Credential,
  Domain
} from '@kirimemail/smtp-sdk';

const client = new SmtpClient('username', 'token');
const credentialsApi = new CredentialsApi(client);
const domainsApi = new DomainsApi(client);
const messagesApi = new MessagesApi(client);

// Create a new credential
const credentialResult = await credentialsApi.createCredential('example.com', 'new_user');
if (credentialResult.success) {
  const credential: Credential = credentialResult.data.credential;
  console.log(`Created credential: ${credential.username}`);
  console.log(`Password: ${credential.password}`); // Available only on create
}

// Send an email
const emailResult = await messagesApi.sendMessage('example.com', {
  from: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Hello from Node.js SDK',
  text: 'This is a test email sent using the KirimEmail Node.js SDK'
});
```

## API Reference

### SmtpClient

The main HTTP client for the Kirim.Email SMTP API.

#### Constructor

```typescript
new SmtpClient(username?, token?, baseUrl?)
```

- `username?: string` - Username for basic authentication
- `token?: string` - Token for basic authentication
- `baseUrl?: string` - Base URL for the API (default: `https://smtp-app.kirim.email`)

#### Methods

- `get<T>(endpoint, params?, options?)` - Make GET request
- `post<T>(endpoint, data?, options?)` - Make POST request
- `postMultipart<T>(endpoint, data?, files?, options?)` - Make POST request with multipart data
- `put<T>(endpoint, data?, options?)` - Make PUT request
- `delete<T>(endpoint, params?, options?)` - Make DELETE request
- `stream<T>(endpoint, params?, options?)` - Stream response data

### API Classes

All API classes use Basic Authentication and follow the same pattern:

```typescript
const client = new SmtpClient('username', 'token');
const api = new ApiClass(client);
```

#### CredentialsApi

Manage SMTP credentials:

- `listCredentials(domain, params?)` - List domain credentials
- `createCredential(domain, username)` - Create new credential
- `getCredential(domain, credentialId)` - Get credential details
- `deleteCredential(domain, credentialId)` - Delete credential
- `resetPassword(domain, credentialId)` - Reset credential password

#### DomainsApi

Manage domains and DNS settings:

- `listDomains(params?)` - List all domains
- `createDomain(options)` - Create new domain
- `getDomain(domain)` - Get domain details
- `updateDomain(domain, settings)` - Update domain tracking settings
- `deleteDomain(domain)` - Delete domain
- `setupAuthDomain(domain, options)` - Setup authentication domain
- `verifyMandatoryRecords(domain)` - Verify mandatory DNS records
- `verifyAuthDomainRecords(domain)` - Verify auth domain records
- `setupTrackingDomain(domain, options)` - Setup tracking domain
- `verifyTrackingDomainRecords(domain)` - Verify tracking domain records

#### MessagesApi

Send emails and manage messages:

- `sendMessage(domain, emailData)` - Send simple email
- `sendMessageWithAttachments(domain, emailData, files)` - Send email with attachments
- `sendBulkMessage(domain, emailData)` - Send bulk email
- `sendTemplateMessage(domain, templateData)` - Send template email
- `validateMessage(emailData)` - Validate email data
- `createFileUpload(filename, content, contentType?)` - Create file upload object

#### LogsApi

Retrieve email logs and activity:

- `getLogs(domain, params?)` - Get domain logs with filtering
- `getLogsByDateRange(domain, startDate, endDate, params?)` - Get logs by date range
- `getLogsByMessage(domain, messageGuid)` - Get logs for specific message
- `streamLogs(domain, params?)` - Stream logs in real-time

**LogFilterOptions:**
- `start` - Start date (string or Date)
- `end` - End date (string or Date)
- `sender` - Filter by sender email
- `recipient` - Filter by recipient email
- `event_type` - Filter by event type (queued, send, delivered, bounced, failed, opened, clicked, unsubscribed, temporary_fail, permanent_fail, deferred)
- `tags` - Filter by tags (partial match)
- `limit`, `page`, `offset` - Pagination options

#### SuppressionsApi

Manage email suppressions:

- `getSuppressions(domain, params?)` - Get all suppressions
- `getUnsubscribeSuppressions(domain, params?)` - Get unsubscribe suppressions
- `getBounceSuppressions(domain, params?)` - Get bounce suppressions
- `getWhitelistSuppressions(domain, params?)` - Get whitelist suppressions
- `createWhitelistSuppression(domain, recipient)` - Add to whitelist
- `deleteUnsubscribeSuppressions(domain, ids)` - Delete unsubscribe suppressions
- `deleteBounceSuppressions(domain, ids)` - Delete bounce suppressions
- `deleteWhitelistSuppressions(domain, ids)` - Delete whitelist suppressions

#### EmailValidationApi

Validate email addresses with comprehensive checks:

- `validateEmail(email)` - Validate single email
- `validateEmailStrict(email)` - Validate email with strict mode
- `validateEmailBulk(emails)` - Validate multiple emails (max 100)
- `validateEmailBulkStrict(emails)` - Validate multiple emails with strict mode

#### WebhooksApi

Manage webhook configurations for event notifications:

- `listWebhooks(domain, params?)` - List all webhooks
- `createWebhook(domain, options)` - Create new webhook
- `getWebhook(domain, webhookGuid)` - Get specific webhook
- `updateWebhook(domain, webhookGuid, options)` - Update webhook
- `deleteWebhook(domain, webhookGuid)` - Delete webhook
- `testWebhook(domain, webhookGuid)` - Test webhook URL

## Models

### Credential

Represents an SMTP credential with the following properties:

- `id?: number` - Credential ID
- `userSmtpGuid?: string` - User SMTP GUID
- `username?: string` - SMTP username
- `isVerified?: boolean` - Verification status
- `status?: boolean` - Active status
- `password?: string` - Password (available on create/reset)
- `strengthInfo?: Record<string, any>` - Password strength information
- `remoteSynced?: boolean` - Remote sync status
- And more timestamp fields...

#### Methods

- `getCreatedDate(): Date | null` - Get created date as Date object
- `isActive(): boolean` - Check if credential is active
- `isActiveAndVerified(): boolean` - Check if active and verified

### Pagination

Represents pagination metadata:

- `total?: number` - Total number of items
- `perPage?: number` - Items per page
- `currentPage?: number` - Current page number
- `lastPage?: number` - Last page number

#### Methods

- `hasNextPage(): boolean` - Check if more pages exist
- `hasPreviousPage(): boolean` - Check if previous page exists
- `getNextPage(): number | null` - Get next page number
- `getSummary(): string` - Get pagination summary

### EmailValidationResult

Represents email validation result:

- `email: string` - Validated email address
- `isValid: boolean` - Whether email passed all validation checks
- `error: string | null` - Error message if validation failed
- `warnings: string[]` - Array of validation warnings
- `cached: boolean` - Whether result was served from cache
- `validatedAt: string` - ISO timestamp of validation
- `isSpamtrap: boolean` - Whether email is likely a spamtrap
- `spamtrapScore: number` - Spamtrap probability score (0.0-1.0)

### Webhook

Represents webhook configuration:

- `webhookGuid: string` - Unique webhook identifier (UUID)
- `userGuid: string` - User GUID who owns webhook
- `userDomainGuid: string` - Domain GUID associated with webhook
- `userSmtpGuid: string` - SMTP configuration GUID
- `type: 'queued' | 'send' | 'delivered' | 'bounced' | 'failed' | 'permanent_fail' | 'opened' | 'clicked' | 'unsubscribed' | 'temporary_fail' | 'deferred'` - Event type that triggers webhook
- `url: string` - URL endpoint for webhook events
- `isDeleted: boolean` - Whether webhook has been deleted
- `createdAt: number` - Creation timestamp
- `modifiedAt: number` - Last modified timestamp

## Error Handling

The SDK provides comprehensive error handling with custom exception classes:

```javascript
try {
  await credentialsApi.createCredential('example.com', 'test_user');
} catch (error) {
  if (error.name === 'AuthenticationException') {
    console.log('Authentication failed:', error.message);
  } else if (error.name === 'ValidationException') {
    console.log('Validation failed:', error.message);
    if (error.hasErrors()) {
      console.log('Field errors:', error.getErrorMessages());
    }
  } else if (error.name === 'NotFoundException') {
    console.log('Resource not found:', error.message);
  } else if (error.name === 'ServerException') {
    console.log('Server error:', error.message);
  } else {
    console.log('API error:', error.message);
  }
}
```

### Exception Classes

- `ApiException` - Base exception for all API errors
- `AuthenticationException` - Authentication errors (401, 403)
- `ValidationException` - Validation errors (400, 422)
- `NotFoundException` - Resource not found (404)
- `ServerException` - Server errors (500+)

## Examples

See the `examples/` directory for complete usage examples:

```bash
node examples/comprehensive-example.js
```

### Basic Usage Examples

#### Working with Domains

```javascript
const { DomainsApi } = require('@kirimemail/smtp-sdk');

const domainsApi = new DomainsApi(client);

// List all domains
const domains = await domainsApi.listDomains({ limit: 10 });
domains.data.forEach(domain => {
  console.log(`Domain: ${domain.domain}, Verified: ${domain.isVerified}`);
});

// Create a new domain
const result = await domainsApi.createDomain({
  domain: 'newdomain.com',
  dkim_key_length: 2048
});

// Verify DNS records
const verification = await domainsApi.verifyMandatoryRecords('newdomain.com');
console.log('DKIM valid:', verification.data.records.dkim);
```

#### Working with Credentials

```javascript
const { CredentialsApi } = require('@kirimemail/smtp-sdk');

const credentialsApi = new CredentialsApi(client);

// Create a new SMTP credential
const credential = await credentialsApi.createCredential('example.com', 'newsletter');
console.log(`Username: ${credential.data.credential.username}`);
console.log(`Password: ${credential.data.password}`); // Save this securely

// List all credentials
const credentials = await credentialsApi.listCredentials('example.com');
console.log(`Found ${credentials.data.length} credentials`);

// Reset password
const resetResult = await credentialsApi.resetPassword('example.com', credentialId);
console.log(`New password: ${resetResult.data.new_password}`);
```

#### Sending Emails

```javascript
const { MessagesApi } = require('@kirimemail/smtp-sdk');

const messagesApi = new MessagesApi(client);

// Send a simple email
const result = await messagesApi.sendMessage('example.com', {
  from: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Welcome!',
  text: 'Thank you for joining us.',
  html: '<h1>Thank you for joining us!</h1><p>Welcome to our service.</p>'
});

// Send email with attachment
const fs = require('fs');
const attachment = messagesApi.createFileUpload(
  'document.pdf',
  fs.readFileSync('document.pdf'),
  'application/pdf'
);

await messagesApi.sendMessageWithAttachments('example.com', {
  from: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Document attached',
  text: 'Please find the document attached.'
}, [attachment]);

// Send bulk email
await messagesApi.sendBulkMessage('example.com', {
  from: 'newsletter@example.com',
  to: ['user1@example.com', 'user2@example.com', 'user3@example.com'],
  subject: 'Weekly Newsletter',
  text: 'Here is your weekly newsletter...'
});
```

#### Working with Logs

```javascript
const { LogsApi } = require('@kirimemail/smtp-sdk');

const logsApi = new LogsApi(client);

// Get recent logs
const logs = await logsApi.getLogs('example.com', {
  limit: 50,
  start: '2024-01-01',
  end: '2024-01-31'
});

logs.data.forEach(log => {
  console.log(`${log.timestamp}: ${log.eventType} to ${log.recipient}`);
});

// Stream logs in real-time
for await (const log of logsApi.streamLogs('example.com', { limit: 100 })) {
  console.log(`Live: ${log.eventType} - ${log.recipient}`);
}
```

#### Managing Suppressions

```javascript
const { SuppressionsApi } = require('@kirimemail/smtp-sdk');

const suppressionsApi = new SuppressionsApi(client);

// Get all suppressions
const suppressions = await suppressionsApi.getSuppressions('example.com');
console.log(`Total suppressions: ${suppressions.data.length}`);

// Get bounce suppressions
const bounces = await suppressionsApi.getBounceSuppressions('example.com');

// Add email to whitelist
await suppressionsApi.createWhitelistSuppression('example.com', 'important@client.com');

// Delete suppressions by IDs
await suppressionsApi.deleteBounceSuppressions('example.com', [1,2,3]);
```

#### Validating Emails

```javascript
const { EmailValidationApi } = require('@kirimemail/smtp-sdk');

const emailValidationApi = new EmailValidationApi(client);

// Validate a single email
const result = await emailValidationApi.validateEmail('user@example.com');
if (result.data.isValid) {
  console.log('Email is valid');
  console.log('Spamtrap score:', result.data.spamtrapScore);
} else {
  console.log('Email is invalid:', result.data.error);
}

// Bulk validate emails
const bulkResult = await emailValidationApi.validateEmailBulk([
  'user1@example.com',
  'user2@example.com',
  'invalid-email'
]);
console.log('Valid:', bulkResult.data.summary.valid);
console.log('Invalid:', bulkResult.data.summary.invalid);
console.log('Cached:', bulkResult.data.summary.cached);
```

#### Managing Webhooks

```javascript
const { WebhooksApi } = require('@kirimemail/smtp-sdk');

const webhooksApi = new WebhooksApi(client);

// List all webhooks
const webhooks = await webhooksApi.listWebhooks('example.com');
console.log(`Found ${webhooks.data.length} webhooks`);

// Create a webhook for delivery events
const webhook = await webhooksApi.createWebhook('example.com', {
  type: 'delivered',
  url: 'https://your-app.com/webhooks/delivered'
});
console.log('Webhook created:', webhook.data.webhookGuid);

// Update webhook
await webhooksApi.updateWebhook('example.com', webhook.data.webhookGuid, {
  url: 'https://your-app.com/webhooks/updated'
});

// Test webhook
const test = await webhooksApi.testWebhook('example.com', webhook.data.webhookGuid);
console.log('Webhook test result:', test.message);

// Delete webhook
await webhooksApi.deleteWebhook('example.com', webhook.data.webhookGuid);
console.log('Webhook deleted');
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## License

MIT License - see LICENSE file for details.

## Support

- 📧 Email: support@kirim.email
- 🌐 Website: https://kirim.email
- 📚 Documentation: https://docs.kirim.email
- 🐛 Issues: https://github.com/kirimemail/kirimemail-smtp-node-sdk/issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and changes.