# Kirim.Email SMTP Node.js SDK API Documentation

This document provides detailed API documentation for the Kirim.Email SMTP Node.js SDK.

## Table of Contents

- [SmtpClient](#smtpclient)
- [CredentialsApi](#credentialsapi)
- [DomainsApi](#domainsapi)
- [MessagesApi](#messagesapi)
- [LogsApi](#logsapi)
- [SuppressionsApi](#suppressionsapi)
- [Models](#models)
- [Exceptions](#exceptions)
- [Types](#types)

## SmtpClient

The main HTTP client for the Kirim.Email SMTP API. All API classes use this client internally.

### Constructor

```typescript
new SmtpClient(username?: string, token?: string, baseUrl?: string)
```

**Parameters:**
- `username?: string` - Username for basic authentication
- `token?: string` - Token for basic authentication
- `baseUrl?: string` - Base URL for the API (default: `https://smtp-app.kirim.email`)

**Example:**
```typescript
const client = new SmtpClient('my_username', 'my_api_token');
```

### Methods

#### get

Makes a GET request to the API.

```typescript
async get<T>(endpoint: string, params?: Record<string, any>, options?: RequestOptions): Promise<T>
```

**Parameters:**
- `endpoint: string` - API endpoint (relative to base URL)
- `params?: Record<string, any>` - Query parameters
- `options?: RequestOptions` - Request options

#### post

Makes a POST request to the API.

```typescript
async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T>
```

**Parameters:**
- `endpoint: string` - API endpoint
- `data?: any` - Request body data
- `options?: RequestOptions` - Request options

#### postMultipart

Makes a POST request with multipart/form-data.

```typescript
async postMultipart<T>(endpoint: string, data?: any, files?: FileUpload[], options?: RequestOptions): Promise<T>
```

**Parameters:**
- `endpoint: string` - API endpoint
- `data?: any` - Form data fields
- `files?: FileUpload[]` - Files to upload
- `options?: RequestOptions` - Request options

#### put

Makes a PUT request to the API.

```typescript
async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T>
```

**Parameters:**
- `endpoint: string` - API endpoint
- `data?: any` - Request body data
- `options?: RequestOptions` - Request options

#### delete

Makes a DELETE request to the API.

```typescript
async delete<T>(endpoint: string, params?: Record<string, any>, options?: RequestOptions): Promise<T>
```

**Parameters:**
- `endpoint: string` - API endpoint
- `params?: Record<string, any>` - Query parameters
- `options?: RequestOptions` - Request options

#### stream

Streams response data from the API.

```typescript
async stream<T>(endpoint: string, params?: Record<string, any>, options?: RequestOptions): Promise<AsyncIterable<T>>
```

**Parameters:**
- `endpoint: string` - API endpoint
- `params?: Record<string, any>` - Query parameters
- `options?: RequestOptions` - Request options

**Returns:** Async iterable that yields response data

## CredentialsApi

API class for managing SMTP credentials. Use for creating, listing, and managing domain credentials.

### Constructor

```typescript
new CredentialsApi(client: SmtpClient)
```

### Methods

#### listCredentials

Lists SMTP credentials for a domain.

```typescript
async listCredentials(domain: string, params?: {
  limit?: number;
  page?: number;
}): Promise<{
  data: Credential[];
  domain: string;
  pagination?: Pagination;
}>
```

**Parameters:**
- `domain: string` - Domain name
- `params?: object` - Query parameters

**Example:**
```typescript
const result = await credentialsApi.listCredentials('example.com', { limit: 10 });
console.log(`Found ${result.data.length} credentials`);
```

#### createCredential

Creates a new SMTP credential.

```typescript
async createCredential(domain: string, username: string): Promise<{
  success: boolean;
  message?: string;
  data: {
    credential: Credential;
    password: string;
    remote_synced: boolean;
  };
}>
```

**Parameters:**
- `domain: string` - Domain name
- `username: string` - SMTP username

**Example:**
```typescript
const result = await credentialsApi.createCredential('example.com', 'newsletter');
if (result.success) {
  console.log(`Password: ${result.data.password}`); // Save this securely
}
```

#### getCredential

Gets details of a specific credential.

```typescript
async getCredential(domain: string, credentialId: string | number): Promise<{
  success: boolean;
  data: Credential;
}>
```

**Parameters:**
- `domain: string` - Domain name
- `credentialId: string | number` - Credential ID or GUID

#### deleteCredential

Deletes a credential.

```typescript
async deleteCredential(domain: string, credentialId: string | number): Promise<{
  success: boolean;
  message?: string;
}>
```

**Parameters:**
- `domain: string` - Domain name
- `credentialId: string | number` - Credential ID or GUID

#### resetPassword

Resets a credential's password.

```typescript
async resetPassword(domain: string, credentialId: string | number): Promise<{
  success: boolean;
  message?: string;
  data: {
    credential: Credential;
    new_password: string;
    strength_info: Record<string, any>;
    remote_synced: boolean;
  };
}>
```

**Parameters:**
- `domain: string` - Domain name
- `credentialId: string | number` - Credential ID or GUID

## DomainsApi

API class for managing domains and their DNS configurations.

### Constructor

```typescript
new DomainsApi(client: SmtpClient)
```

### Methods

#### listDomains

Lists all domains for the authenticated user.

```typescript
async listDomains(params?: {
  limit?: number;
  page?: number;
  search?: string;
}): Promise<{
  data: Domain[];
  pagination: Pagination;
}>
```

**Parameters:**
- `params?: object` - Query parameters

#### createDomain

Creates a new domain.

```typescript
async createDomain(options: CreateDomainOptions): Promise<{
  success: boolean;
  message?: string;
  data: {
    domain: string;
  };
}>
```

**Parameters:**
- `options: CreateDomainOptions` - Domain creation options
  - `domain: string` - Domain name
  - `dkim_key_length: 1024 | 2048` - DKIM key length

#### getDomain

Gets details of a specific domain.

```typescript
async getDomain(domain: string): Promise<{
  success: boolean;
  data: Domain;
}>
```

**Parameters:**
- `domain: string` - Domain name

#### updateDomain

Updates domain tracking settings.

```typescript
async updateDomain(domain: string, settings: DomainTrackingSettings): Promise<{
  success: boolean;
  data: DomainTrackingSettings;
}>
```

**Parameters:**
- `domain: string` - Domain name
- `settings: DomainTrackingSettings` - Tracking settings
  - `open_track?: boolean` - Enable open tracking
  - `click_track?: boolean` - Enable click tracking
  - `unsub_track?: boolean` - Enable unsubscribe tracking

#### deleteDomain

Deletes a domain.

```typescript
async deleteDomain(domain: string): Promise<{
  success: boolean;
  message?: string;
}>
```

**Parameters:**
- `domain: string` - Domain name

#### setupAuthDomain

Sets up authentication domain.

```typescript
async setupAuthDomain(domain: string, options: AuthDomainSetupOptions): Promise<{
  success: boolean;
  data: {
    auth_domain: string;
  };
}>
```

**Parameters:**
- `domain: string` - Domain name
- `options: AuthDomainSetupOptions` - Auth domain setup options
  - `auth_domain?: string` - Authentication domain
  - `dkim_key_length: 1024 | 2048` - DKIM key length

#### verifyMandatoryRecords

Verifies mandatory DNS records.

```typescript
async verifyMandatoryRecords(domain: string): Promise<{
  success: boolean;
  data: {
    records: {
      dkim: boolean;
      spf: boolean;
      mx: boolean;
    };
  };
}>
```

**Parameters:**
- `domain: string` - Domain name

#### verifyAuthDomainRecords

Verifies authentication domain DNS records.

```typescript
async verifyAuthDomainRecords(domain: string): Promise<{
  success: boolean;
  data: {
    records: {
      auth_dkim: boolean;
      auth_spf: boolean;
      auth_mx: boolean;
    };
  };
}>
```

**Parameters:**
- `domain: string` - Domain name

#### setupTrackingDomain

Sets up tracking domain.

```typescript
async setupTrackingDomain(domain: string, options: TrackingDomainSetupOptions): Promise<{
  success: boolean;
  data: {
    tracking_domain: string;
  };
}>
```

**Parameters:**
- `domain: string` - Domain name
- `options: TrackingDomainSetupOptions` - Tracking domain setup options
  - `tracking_domain: string` - Tracking domain name

#### verifyTrackingDomainRecords

Verifies tracking domain DNS records.

```typescript
async verifyTrackingDomainRecords(domain: string): Promise<{
  success: boolean;
  data: {
    records: {
      cname: boolean;
      tracking_domain: string;
    };
  };
}>
```

**Parameters:**
- `domain: string` - Domain name

## MessagesApi

API class for sending emails and managing messages.

### Constructor

```typescript
new MessagesApi(client: SmtpClient)
```

### Methods

#### sendMessage

Sends a simple email.

```typescript
async sendMessage(domain: string, emailData: EmailMessage): Promise<{
  success: boolean;
  message?: string;
  data?: any;
}>
```

**Parameters:**
- `domain: string` - Domain name
- `emailData: EmailMessage` - Email message data
  - `from: string` - From email address
  - `to: string | string[]` - To email address(es)
  - `cc?: string | string[]` - CC email address(es)
  - `bcc?: string | string[]` - BCC email address(es)
  - `subject: string` - Email subject
  - `text?: string` - Plain text content
  - `html?: string` - HTML content
  - `headers?: Record<string, string>` - Custom headers

#### sendMessageWithAttachments

Sends an email with attachments.

```typescript
async sendMessageWithAttachments(domain: string, emailData: EmailMessage, files: FileUpload[]): Promise<{
  success: boolean;
  message?: string;
  data?: any;
}>
```

**Parameters:**
- `domain: string` - Domain name
- `emailData: EmailMessage` - Email message data
- `files: FileUpload[]` - Array of files to attach

#### sendBulkMessage

Sends a bulk email to multiple recipients.

```typescript
async sendBulkMessage(domain: string, emailData: EmailMessage): Promise<{
  success: boolean;
  message?: string;
  data?: any;
}>
```

**Parameters:**
- `domain: string` - Domain name
- `emailData: EmailMessage` - Email message data (to field should be array)

#### sendTemplateMessage

Sends a template-based email.

```typescript
async sendTemplateMessage(domain: string, templateData: TemplateMessage): Promise<{
  success: boolean;
  message?: string;
  data?: any;
}>
```

**Parameters:**
- `domain: string` - Domain name
- `templateData: TemplateMessage` - Template message data
  - `template_guid: string` - Template GUID
  - `to: string | string[]` - To email address(es)
  - `variables?: Record<string, any>` - Template variables

#### validateMessage

Validates email message data without sending.

```typescript
async validateMessage(emailData: EmailMessage): Promise<{
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}>
```

**Parameters:**
- `emailData: EmailMessage` - Email message data to validate

#### createFileUpload

Creates a file upload object for attachments.

```typescript
createFileUpload(filename: string, content: Buffer | string, contentType?: string): FileUpload
```

**Parameters:**
- `filename: string` - File name
- `content: Buffer | string` - File content
- `contentType?: string` - MIME type

**Returns:** `FileUpload` object

## LogsApi

API class for retrieving email logs and activity data.

### Constructor

```typescript
new LogsApi(client: SmtpClient)
```

### Methods

#### getLogs

Gets domain logs with filtering options.

```typescript
async getLogs(domain: string, params?: LogFilterOptions): Promise<{
  data: LogEntry[];
  pagination?: Pagination;
}>
```

**Parameters:**
- `domain: string` - Domain name
- `params?: LogFilterOptions` - Filter options
  - `start?: string | Date` - Start date/time
  - `end?: string | Date` - End date/time
  - `sender?: string` - Filter by sender
  - `recipient?: string` - Filter by recipient
  - `limit?: number` - Limit results
  - `page?: number` - Page number
  - `offset?: number` - Offset

#### getLogsByDateRange

Gets logs filtered by date range.

```typescript
async getLogsByDateRange(domain: string, startDate: string | Date, endDate: string | Date, params?: {
  limit?: number;
  page?: number;
  offset?: number;
}): Promise<{
  data: LogEntry[];
  pagination?: Pagination;
}>
```

**Parameters:**
- `domain: string` - Domain name
- `startDate: string | Date` - Start date
- `endDate: string | Date` - End date
- `params?: object` - Additional parameters

#### getLogsByMessage

Gets logs for a specific message.

```typescript
async getLogsByMessage(domain: string, messageGuid: string): Promise<{
  data: LogEntry[];
}>
```

**Parameters:**
- `domain: string` - Domain name
- `messageGuid: string` - Message GUID

#### streamLogs

Streams logs in real-time.

```typescript
async streamLogs(domain: string, params?: LogFilterOptions): Promise<AsyncIterable<LogEntry>>
```

**Parameters:**
- `domain: string` - Domain name
- `params?: LogFilterOptions` - Filter options

**Returns:** Async iterable that yields LogEntry objects

**Example:**
```typescript
for await (const log of logsApi.streamLogs('example.com')) {
  console.log(`${log.timestamp}: ${log.eventType} to ${log.recipient}`);
}
```

## SuppressionsApi

API class for managing email suppressions (bounces, unsubscribes, etc.).

### Constructor

```typescript
new SuppressionsApi(client: SmtpClient)
```

### Methods

#### getSuppressions

Gets all suppressions for a domain.

```typescript
async getSuppressions(domain: string, params?: {
  limit?: number;
  page?: number;
  offset?: number;
  type?: string;
  search?: string;
}): Promise<{
  data: Suppression[];
  pagination?: Pagination;
}>
```

**Parameters:**
- `domain: string` - Domain name
- `params?: object` - Query parameters

#### getUnsubscribeSuppressions

Gets unsubscribe suppressions.

```typescript
async getUnsubscribeSuppressions(domain: string, params?: {
  limit?: number;
  page?: number;
  offset?: number;
  search?: string;
}): Promise<{
  data: Suppression[];
  pagination?: Pagination;
}>
```

**Parameters:**
- `domain: string` - Domain name
- `params?: object` - Query parameters

#### getBounceSuppressions

Gets bounce suppressions.

```typescript
async getBounceSuppressions(domain: string, params?: {
  limit?: number;
  page?: number;
  offset?: number;
  search?: string;
}): Promise<{
  data: Suppression[];
  pagination?: Pagination;
}>
```

**Parameters:**
- `domain: string` - Domain name
- `params?: object` - Query parameters

#### getWhitelistSuppressions

Gets whitelist suppressions.

```typescript
async getWhitelistSuppressions(domain: string, params?: {
  limit?: number;
  page?: number;
  offset?: number;
  search?: string;
}): Promise<{
  data: Suppression[];
  pagination?: Pagination;
}>
```

**Parameters:**
- `domain: string` - Domain name
- `params?: object` - Query parameters

#### createWhitelistSuppression

Adds an email to the whitelist.

```typescript
async createWhitelistSuppression(domain: string, recipient: string): Promise<{
  success: boolean;
  message?: string;
  data: Suppression;
}>
```

**Parameters:**
- `domain: string` - Domain name
- `recipient: string` - Email address to whitelist

#### deleteUnsubscribeSuppressions

Deletes unsubscribe suppressions by IDs.

```typescript
async deleteUnsubscribeSuppressions(domain: string, ids: number[]): Promise<{
  success: boolean;
  message?: string;
  deleted_count?: number;
}>
```

**Parameters:**
- `domain: string` - Domain name
- `ids: number[]` - Array of suppression IDs to delete

#### deleteBounceSuppressions

Deletes bounce suppressions by IDs.

```typescript
async deleteBounceSuppressions(domain: string, ids: number[]): Promise<{
  success: boolean;
  message?: string;
  deleted_count?: number;
}>
```

**Parameters:**
- `domain: string` - Domain name
- `ids: number[]` - Array of suppression IDs to delete

#### deleteWhitelistSuppressions

Deletes whitelist suppressions by IDs.

```typescript
async deleteWhitelistSuppressions(domain: string, ids: number[]): Promise<{
  success: boolean;
  message?: string;
  deleted_count?: number;
}>
```

**Parameters:**
- `domain: string` - Domain name
- `ids: number[]` - Array of suppression IDs to delete

## Models

### Credential

Represents an SMTP credential.

**Properties:**
- `id?: number` - Credential ID
- `userSmtpGuid?: string` - User SMTP GUID
- `username?: string` - SMTP username
- `isVerified?: boolean` - Verification status
- `status?: boolean` - Active status
- `password?: string` - Password (available on create/reset)
- `strengthInfo?: Record<string, any>` - Password strength information
- `remoteSynced?: boolean` - Remote sync status
- `createdAt?: number` - Creation timestamp
- `updatedAt?: number` - Update timestamp

**Methods:**
- `getCreatedDate(): Date | null` - Get created date as Date object
- `isActive(): boolean` - Check if credential is active
- `isActiveAndVerified(): boolean` - Check if active and verified

### Domain

Represents a domain configuration.

**Properties:**
- `domain?: string` - Domain name
- `isVerified?: boolean` - Verification status
- `dkimPublicKey?: string` - DKIM public key
- `dkimSelector?: string` - DKIM selector
- `trackingSettings?: DomainTrackingSettings` - Tracking configuration
- `authDomain?: string` - Authentication domain
- `trackingDomain?: string` - Tracking domain
- And many more properties...

**Methods:**
- `getCreatedDate(): Date | null` - Get created date as Date object
- `isVerified(): boolean` - Check if domain is verified
- `getDNSConfiguration(): object` - Get DNS configuration object

### LogEntry

Represents an email log entry.

**Properties:**
- `id?: number` - Log entry ID
- `eventType?: string` - Event type (sent, delivered, bounced, etc.)
- `recipient?: string` - Recipient email address
- `sender?: string` - Sender email address
- `subject?: string` - Email subject
- `timestamp?: number` - Event timestamp
- `messageGuid?: string` - Message GUID
- And many more properties...

**Methods:**
- `getTimestampDate(): Date | null` - Get timestamp as Date object
- `getEventCategory(): string` - Get event category (sent, failed, etc.)

### Suppression

Represents an email suppression.

**Properties:**
- `id?: number` - Suppression ID
- `recipient?: string` - Suppressed email address
- `type?: string` - Suppression type (bounce, unsubscribe, etc.)
- `reason?: string` - Suppression reason
- `createdAt?: number` - Creation timestamp

**Methods:**
- `getCreatedDate(): Date | null` - Get created date as Date object
- `getCategory(): string` - Get suppression category

### Pagination

Represents pagination metadata.

**Properties:**
- `total?: number` - Total number of items
- `perPage?: number` - Items per page
- `currentPage?: number` - Current page number
- `lastPage?: number` - Last page number

**Methods:**
- `hasNextPage(): boolean` - Check if more pages exist
- `hasPreviousPage(): boolean` - Check if previous page exists
- `getNextPage(): number | null` - Get next page number
- `getPreviousPage(): number | null` - Get previous page number
- `getSummary(): string` - Get pagination summary

## Exceptions

The SDK provides comprehensive error handling with custom exception classes:

### ApiException

Base exception for all API errors.

**Properties:**
- `message: string` - Error message
- `statusCode?: number` - HTTP status code
- `errors?: Record<string, string[]>` - Field validation errors

**Methods:**
- `hasErrors(): boolean` - Check if field errors exist
- `getErrorMessages(): string[]` - Get all field error messages

### AuthenticationException

Thrown for authentication errors (401, 403).

### ValidationException

Thrown for validation errors (400, 422).

### NotFoundException

Thrown when a resource is not found (404).

### ServerException

Thrown for server errors (500+).

## Types

### RequestOptions

HTTP request options.

```typescript
interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}
```

### ApiResponse

Standard API response wrapper.

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
  domain?: string;
  pagination?: Pagination;
  count?: number;
  offset?: number;
  limit?: number;
}
```

### EmailMessage

Email message data structure.

```typescript
interface EmailMessage {
  from: string;
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: FileUpload[];
  headers?: Record<string, string>;
}
```

### FileUpload

File upload structure for attachments.

```typescript
interface FileUpload {
  field: string;
  filename: string;
  content: Buffer | string;
  contentType?: string;
}
```

And many more type definitions available in the `types/index.ts` file.