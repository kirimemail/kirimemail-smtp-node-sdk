# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-03-29

### Added
- **LogsApi**: Added `event_type` and `tags` filter options to `LogFilterOptions` for enhanced log filtering
- **GitHub Actions**: Added publish workflow for npm publishing on version tags

### Changed
- Updated `LogFilterOptions` interface to support event type and tags filtering

## [1.0.1] - 2026-03-25

### Added
- **EmailValidationApi**: New API for email address validation
  - Validate single email with comprehensive checks (RFC compliance, DNS checks, spamtrap detection)
  - Validate email with strict mode (no warnings)
  - Bulk validation for up to 100 emails
  - Bulk validation with strict mode
  - Results include spamtrap detection scores and caching information
- **WebhooksApi**: New API for webhook management
  - List all webhooks with event type filtering
  - Create webhooks for email event notifications
  - Get webhook details by GUID
  - Update webhook configuration
  - Delete webhooks
  - Test webhook URLs for connectivity
- **EmailValidationResult**: New model for validation results
  - Includes validation status, warnings, spamtrap detection
  - Cache information and timestamp tracking
- **Webhook**: New model for webhook configurations
  - Event types: queued, send, delivered, bounced, failed, permanent_fail, opened, clicked, unsubscribed, temporary_fail, deferred
  - Complete webhook metadata (guids, URLs, timestamps)

### Changed
- Updated README with EmailValidationApi and WebhooksApi documentation
- Added usage examples for email validation and webhooks
- Exported new APIs and models from main index

### Features
- Email validation with spamtrap detection
- Bulk validation for up to 100 emails
- Comprehensive webhook management
- Event type filtering for webhooks
- Webhook testing capability
- Enhanced documentation with new API examples

## [1.0.0] - 2025-10-02

### Added
- Initial release of Kirim.Email SMTP Node.js SDK
- Full TypeScript support with comprehensive type definitions
- Modern HTTP client using `ky`
- Basic Authentication support
- Complete API coverage:
  - **CredentialsApi**: Manage SMTP credentials
  - **DomainsApi**: Manage domains and DNS verification
  - **LogsApi**: Retrieve email logs with streaming support
  - **MessagesApi**: Send emails (single, bulk, template) with attachments
  - **SuppressionsApi**: Manage email suppressions (unsubscribe, bounce, whitelist)
- Comprehensive models:
  - Credential
  - Domain
  - LogEntry
  - Pagination
  - Suppression
- Custom exception classes for better error handling:
  - ApiException
  - AuthenticationException
  - ValidationException
  - NotFoundException
  - ServerException
- Async/await support throughout
- Streaming log retrieval with async generators
- Multipart form data support for email attachments
- Automatic retry logic for transient failures
- Comprehensive unit test coverage (108 tests)
- Usage examples and documentation

### Features
- Send single, bulk, and template-based emails
- Manage SMTP credentials per domain
- Domain verification and DNS record management
- Email suppression management (bounces, unsubscribes, whitelist)
- Retrieve and stream email delivery logs
- Full pagination support for list endpoints
- Date/time handling utilities
- Comprehensive error handling

[1.0.0]: https://github.com/kirimemail/kirimemail-smtp-node-sdk/releases/tag/v1.0.0
[1.0.1]: https://github.com/kirimemail/kirimemail-smtp-node-sdk/releases/tag/v1.0.1
