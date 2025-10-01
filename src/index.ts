// Core client and exceptions
export { SmtpClient } from './client/SmtpClient';
export {
  ApiException,
  AuthenticationException,
  ValidationException,
  NotFoundException,
  ServerException,
} from './exceptions';

// Models
export {
  Credential,
  Domain,
  LogEntry,
  Pagination,
  Suppression,
} from './models';

// SMTP Event Constants
export { SMTP_EVENTS } from './models/LogEntry';

// Type definitions
export type {
  BasicAuthCredentials,
  RequestOptions,
  ApiResponse,
  Pagination as PaginationType,
  PaginatedResponse,
  FileUpload,
  LogFilterOptions,
  DomainTrackingSettings,
  CreateDomainOptions,
  CreateCredentialOptions,
  EmailMessage,
  TemplateMessage,
  AuthDomainSetupOptions,
  TrackingDomainSetupOptions,
} from './types';

// API classes
export { CredentialsApi, DomainsApi, LogsApi, MessagesApi, SuppressionsApi } from './api';

// Re-export for convenience
export type {
  CredentialData,
  DomainData,
  LogEntryData,
  PaginationData,
  SuppressionData,
} from './models';