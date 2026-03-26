# Kirim.Email SMTP Node.js SDK - Implementation Guide

## Overview

This document provides a comprehensive guide for implementing and maintaining the Node.js SDK for the Kirim.Email SMTP API. The SDK uses only Basic Authentication and implements all endpoints from the OpenAPI specification that use `basicAuth`.

## Current Implementation Status

**Overall Progress**: 37/37 endpoints implemented (100%) ✅

| API | Endpoints | Implemented | Status |
|-----|-----------|-------------|--------|
| Credentials API | 5 | 5 | ✅ 100% |
| Domains API | 8 | 8 | ✅ 100% |
| Logs API | 3 | 3 | ✅ 100% |
| Messages API | 2 | 2 | ✅ 100% |
| Suppressions API | 8 | 8 | ✅ 100% |
| Email Validation API | 4 | 4 | ✅ 100% |
| Webhooks API | 6 | 6 | ✅ 100% |
| User/Quota API | 1 | 1 | ✅ 100% |

**Models Implemented**: 8/8 (100%) ✅
**Type Definitions**: Complete (100%) ✅

## Package Information

- **Name**: `@kirimemail/smtp-sdk`
- **Version**: 1.0.1
- **Node.js**: >= 18.0.0
- **Repository**: https://github.com/kirimemail/kirimemail-smtp-node-sdk
- **License**: MIT

## Authentication Method

The SDK uses **Basic Authentication** for all endpoints:

```typescript
const client = new SmtpClient('username', 'token');
```

- **Authentication**: HTTP Basic Auth (username:token encoded in base64)
- **Base URL**: `https://smtp-app.kirim.email` (configurable)
- **All endpoints** use Basic Authentication - no Domain API Key authentication required

## Package Structure

```
@kirimemail/smtp-sdk/
├── package.json
├── README.md
├── CHANGELOG.md
├── tsconfig.json
├── tsconfig.build.json
├── tsconfig.test.json
├── jest.config.js
├── .npmignore
├── .eslintrc.js
├── src/
│   ├── index.ts (main export)
│   ├── client/
│   │   └── SmtpClient.ts (HTTP client with Basic Auth)
│   ├── api/
│   │   ├── CredentialsApi.ts
│   │   ├── DomainsApi.ts
│   │   ├── LogsApi.ts
│   │   ├── MessagesApi.ts
│   │   ├── SuppressionsApi.ts
│   │   ├── EmailValidationApi.ts
│   │   ├── WebhooksApi.ts
│   │   ├── UserApi.ts
│   │   └── index.ts
│   ├── models/
│   │   ├── Credential.ts
│   │   ├── Domain.ts
│   │   ├── LogEntry.ts
│   │   ├── Pagination.ts
│   │   ├── Suppression.ts
│   │   ├── EmailValidationResult.ts
│   │   ├── Webhook.ts
│   │   ├── Quota.ts
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts
│   └── exceptions/
│       ├── ApiException.ts
│       ├── AuthenticationException.ts
│       ├── ValidationException.ts
│       ├── NotFoundException.ts
│       ├── ServerException.ts
│       └── index.ts
├── dist/ (compiled output)
├── docs/
│   └── api.md
├── examples/
│   └── usage.js
└── tests/
    ├── unit/
    └── integration/
```

## API Endpoints

### 1. Credentials API

**Base Path**: `/api/domains/{domain}/credentials`

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/domains/{domain}/credentials` | List domain credentials |
| POST | `/api/domains/{domain}/credentials` | Create new credential |
| GET | `/api/domains/{domain}/credentials/{credential}` | Get credential details |
| DELETE | `/api/domains/{domain}/credentials/{credential}` | Delete credential |
| PUT | `/api/domains/{domain}/credentials/{credential}/reset-password` | Reset credential password |

**Implementation**: ✅ Completed in `CredentialsApi.ts`

### 2. Domains API

**Base Path**: `/api/domains`

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/domains` | List domains |
| POST | `/api/domains` | Create new domain |
| GET | `/api/domains/{domain}` | Get domain details |
| PUT | `/api/domains/{domain}` | Update domain configuration |
| DELETE | `/api/domains/{domain}` | Delete domain |
| POST | `/api/domains/{domain}/setup-auth-domain` | Setup authentication domain |
| POST | `/api/domains/{domain}/verify-mandatory` | Verify mandatory DNS records |
| POST | `/api/domains/{domain}/verify-auth-domain` | Verify authentication domain records |
| POST | `/api/domains/{domain}/setup-tracklink` | Setup tracking domain |
| POST | `/api/domains/{domain}/verify-tracklink` | Verify tracking domain records |

**Implementation**: ✅ Completed in `DomainsApi.ts`

### 3. Logs API

**Base Path**: `/api/domains/{domain}/log`

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/domains/{domain}/log` | Get logs for domain |
| GET | `/api/domains/{domain}/log/{message_guid}` | Get logs for specific message |
| GET | `/api/domains/{domain}/log/stream` | Stream logs in real-time |

**Implementation**: ✅ Completed in `LogsApi.ts`

### 4. Messages API

**Base Path**: `/api/domains/{domain}/message`

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/domains/{domain}/message` | Send email (supports attachments and bulk) |
| POST | `/api/domains/{domain}/message/template` | Send template-based email |

**Implementation**: ✅ Completed in `MessagesApi.ts`

### 5. Suppressions API

**Base Path**: `/api/domains/{domain}/suppressions`

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/domains/{domain}/suppressions` | Get all suppressions |
| GET | `/api/domains/{domain}/suppressions/unsubscribes` | Get unsubscribe suppressions |
| GET | `/api/domains/{domain}/suppressions/bounces` | Get bounce suppressions |
| GET | `/api/domains/{domain}/suppressions/whitelist` | Get whitelist suppressions |
| POST | `/api/domains/{domain}/suppressions/whitelist` | Create whitelist entry |
| DELETE | `/api/domains/{domain}/suppressions/unsubscribes` | Delete unsubscribes |
| DELETE | `/api/domains/{domain}/suppressions/bounces` | Delete bounces |
| DELETE | `/api/domains/{domain}/suppressions/whitelist` | Delete whitelist entries |

**Implementation**: ✅ Completed in `SuppressionsApi.ts`

### 6. Email Validation API

**Base Path**: `/api/email/validate`

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/email/validate` | Validate single email |
| POST | `/api/email/validate/strict` | Validate email with strict mode |
| POST | `/api/email/validate/bulk` | Validate multiple emails (max 100) |
| POST | `/api/email/validate/bulk/strict` | Validate multiple emails with strict mode |

**Implementation**: ✅ Completed in `EmailValidationApi.ts`

### 7. Webhooks API

**Base Path**: `/api/domains/{domain}/webhooks`

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/domains/{domain}/webhooks` | List webhooks |
| POST | `/api/domains/{domain}/webhooks` | Create webhook |
| GET | `/api/domains/{domain}/webhooks/{webhookGuid}` | Get specific webhook |
| PUT | `/api/domains/{domain}/webhooks/{webhookGuid}` | Update webhook |
| DELETE | `/api/domains/{domain}/webhooks/{webhookGuid}` | Delete webhook |
| POST | `/api/domains/{domain}/webhooks/test` | Test webhook URL |

**Implementation**: ✅ Completed in `WebhooksApi.ts`

### 8. User/Quota API

**Base Path**: `/api/quota`

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/quota` | Get user quota information |

**Implementation**: ✅ Completed in `UserApi.ts`

## Technical Specifications

### Dependencies

```json
{
  "dependencies": {
    "ky": "^1.7.2"
  },
  "devDependencies": {
    "@types/jest": "^29.5.14",
    "@types/node": "^22.9.0",
    "@typescript-eslint/eslint-plugin": "^8.14.0",
    "@typescript-eslint/parser": "^8.14.0",
    "eslint": "^9.14.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.2.5",
    "typescript": "^5.6.3"
  }
}
```

### HTTP Client

The SDK uses **ky** as the HTTP client with the following configuration:

- **Timeout**: 30 seconds (60 seconds for streaming)
- **Retry**: 3 attempts for transient failures (408, 413, 429, 500, 502, 503, 504)
- **Headers**:
  - `User-Agent`: `@kirimemail/smtp-sdk/1.0.1`
  - `Accept`: `application/json`
  - `Content-Type`: `application/json`
  - `Authorization`: `Basic <base64(username:token)>`

### Error Handling

Custom exception classes for different error types:

| Exception | Status Codes |
|-----------|--------------|
| `ValidationException` | 400, 422 |
| `AuthenticationException` | 401, 403 |
| `NotFoundException` | 404 |
| `ServerException` | 500+ |
| `ApiException` | Other errors |

## Models

### Credential
- `id`: number (internal)
- `user_smtp_guid`: string (UUID)
- `username`: string
- `created_at`: number (Unix timestamp)
- `modified_at`: number (Unix timestamp)

### Domain
- `id`: number
- `domain`: string
- `tracklink_domain`: string
- `tracklink_domain_is_verified`: boolean
- `auth_domain_is_verified`: boolean
- `dns_selector`: string
- `dns_record`: string
- `click_track`: boolean
- `open_track`: boolean
- `unsub_track`: boolean
- `is_verified`: boolean
- `status`: boolean
- `created_at`: number
- `modified_at`: number
- `spf_record`: string

### LogEntry
- `id`: string
- `user_guid`: string
- `user_domain_guid`: string
- `event_type`: string
- `message_guid`: string
- `timestamp`: number

### Suppression
- `id`: number
- `type`: 'unsubscribe' | 'bounce' | 'whitelist'
- `recipient_type`: 'email' | 'domain'
- `recipient`: string
- `description`: string
- `source`: string
- `created_at`: number
- `modified_at`: number

### EmailValidationResult
- `email`: string
- `is_valid`: boolean
- `error`: string | null
- `warnings`: string[]
- `cached`: boolean
- `validated_at`: string (ISO timestamp)
- `is_spamtrap`: boolean
- `spamtrap_score`: number (0.0-1.0)

### EmailValidationBatchResult
- `results`: EmailValidationResult[]
- `summary`: {
    - `total`: number
    - `valid`: number
    - `invalid`: number
    - `cached`: number
    - `validated`: number
  }

### Webhook
- `webhook_guid`: string (UUID)
- `user_guid`: string
- `user_domain_guid`: string
- `user_smtp_guid`: string
- `type`: 'queued' | 'send' | 'delivered' | 'bounced' | 'failed' | 'permanent_fail' | 'opened' | 'clicked' | 'unsubscribed' | 'temporary_fail' | 'deferred'
- `url`: string (URI)
- `is_deleted`: boolean
- `created_at`: number
- `modified_at`: number

### Quota
- `current_quota`: number (current available quota)
- `max_quota`: number (maximum allowed quota)
- `usage_percentage`: number (percentage of quota used)

### Pagination
- `total`: number
- `per_page`: number
- `current_page`: number
- `last_page`: number

## Type Definitions

### BasicAuthCredentials
```typescript
interface BasicAuthCredentials {
  username: string;
  token: string;
}
```

### RequestOptions
```typescript
interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}
```

### ApiResponse
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

### LogFilterOptions
```typescript
interface LogFilterOptions {
  start?: string | Date;
  end?: string | Date;
  sender?: string;
  recipient?: string;
  limit?: number;
  page?: number;
  offset?: number;
}
```

### DomainTrackingSettings
```typescript
interface DomainTrackingSettings {
  open_track?: boolean;
  click_track?: boolean;
  unsub_track?: boolean;
}
```

### CreateDomainOptions
```typescript
interface CreateDomainOptions {
  domain: string;
  dkim_key_length: 1024 | 2048;
}
```

### EmailMessage
```typescript
interface EmailMessage {
  from: string;
  from_name?: string;
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

### TemplateMessage
```typescript
interface TemplateMessage {
  template_guid: string;
  to: string | string[];
  from?: string;
  from_name?: string;
  variables?: Record<string, any>;
}
```

### EmailValidationOptions
```typescript
interface EmailValidationOptions {
  email: string;
}
```

### BulkEmailValidationOptions
```typescript
interface BulkEmailValidationOptions {
  emails: string[];
}
```

### WebhookOptions
```typescript
interface WebhookOptions {
  type: 'queued' | 'send' | 'delivered' | 'bounced' | 'failed' | 'permanent_fail' | 'opened' | 'clicked' | 'unsubscribed' | 'temporary_fail' | 'deferred';
  url: string;
}
```

### WebhookUpdateOptions
```typescript
interface WebhookUpdateOptions {
  type?: 'queued' | 'send' | 'delivered' | 'bounced' | 'failed' | 'permanent_fail' | 'opened' | 'clicked' | 'unsubscribed' | 'temporary_fail' | 'deferred';
  url?: string;
}
```

### QuotaResult
```typescript
interface QuotaResult {
  current_quota: number;
  max_quota: number;
  usage_percentage: number;
}
```

## Usage Examples

### Initialization

```typescript
import { SmtpClient, CredentialsApi, DomainsApi } from '@kirimemail/smtp-sdk';

const client = new SmtpClient('username', 'token');
const credentials = new CredentialsApi(client);
const domains = new DomainsApi(client);
```

### List Domains

```typescript
const result = await domains.listDomains({ limit: 10, page: 1 });
console.log(result.data);
console.log(result.pagination);
```

### Create Credential

```typescript
const result = await credentials.createCredential('example.com', 'myuser');
console.log(result.data.credential);
console.log(result.data.password);
```

### Get Logs

```typescript
const result = await logs.getLogs('example.com', {
  start: '2024-01-01T00:00:00Z',
  end: '2024-12-31T23:59:59Z',
  limit: 100
});
```

### Validate Email

```typescript
const result = await emailValidation.validateEmail('user@example.com');
console.log(result.data.is_valid);
console.log(result.data.is_spamtrap);
```

### Bulk Validate Emails

```typescript
const result = await emailValidation.validateEmailBulk([
  'user1@example.com',
  'user2@example.com',
  'user3@example.com'
]);
console.log(result.data.summary);
```

### Create Webhook

```typescript
const result = await webhooks.createWebhook('example.com', {
  type: 'delivered',
  url: 'https://example.com/webhook'
});
```

### Get User Quota

```typescript
const result = await userApi.getQuota();
console.log(`Current quota: ${result.data.current_quota}/${result.data.max_quota}`);
console.log(`Usage: ${result.data.usage_percentage}%`);
```

## Build & Publish

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Publish to npm

```bash
npm login
npm publish --access public
```

### Version Update

```bash
npm version patch  # 1.0.1 -> 1.0.2
npm version minor  # 1.0.1 -> 1.1.0
npm version major  # 1.0.1 -> 2.0.0
```

## Implementation Status

| API | Status | Notes |
|-----|--------|-------|
| CredentialsApi | ✅ Complete | All 5 endpoints implemented |
| DomainsApi | ✅ Complete | All 8 endpoints implemented |
| LogsApi | ✅ Complete | All 3 endpoints implemented |
| MessagesApi | ✅ Complete | All 2 endpoints implemented |
| SuppressionsApi | ✅ Complete | All 8 endpoints implemented |
| EmailValidationApi | ✅ Complete | All 4 endpoints implemented |
| WebhooksApi | ✅ Complete | All 6 endpoints implemented |
| User/QuotaApi | ✅ Complete | All 1 endpoint implemented |
| Models | ✅ Complete | All 8 models implemented |
| Types | ✅ Complete | All type definitions implemented |
| Documentation | ✅ Complete | README and API docs done |
| Tests | ✅ Basic | Model tests done, API tests partial |

## Next Steps

1. ✅ Create integrated documentation (this file)
2. ✅ Implement EmailValidationApi with all validation endpoints
3. ✅ Implement WebhooksApi with all webhook endpoints
4. ✅ Add EmailValidationResult model
5. ✅ Add Webhook model
6. ✅ Add email validation and webhook type definitions
7. ✅ Update main index.ts to export new APIs and models
8. ✅ Implement UserApi with quota endpoint
9. ✅ Add Quota model
10. ✅ Add QuotaResult type definition
11. ⚠️ Add unit tests for EmailValidationApi and WebhooksApi
12. ⚠️ Add unit tests for UserApi
13. ⏳ Publish to npm
14. ⏳ Create GitHub release

## Success Criteria

- [x] All Basic Auth endpoints from OpenAPI spec implemented (37/37) ✅
- [x] Full TypeScript support with comprehensive types ✅
- [x] Comprehensive error handling ✅
- [x] Modern JavaScript patterns (async/await, etc.) ✅
- [x] Well-documented API with examples ✅
- [x] Simplified authentication using only Basic Auth ✅
- [x] All API classes complete (Credentials, Domains, Logs, Messages, Suppressions, EmailValidation, Webhooks, User) ✅
- [x] All models complete (8/8) ✅
- [x] All type definitions complete ✅
- [x] Complete API coverage matching OpenAPI spec (37/37 endpoints) ✅
- [ ] Unit testing framework with full API coverage
- [ ] Ready for npm publication
