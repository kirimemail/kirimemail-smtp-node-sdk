# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
