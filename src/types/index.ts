/**
 * Basic authentication credentials
 */
export interface BasicAuthCredentials {
  username: string;
  token: string;
}

/**
 * HTTP request options
 */
export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = any> {
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

/**
 * Pagination metadata
 */
export interface Pagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}

/**
 * File upload options
 */
export interface FileUpload {
  field: string;
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

/**
 * Log filtering options
 */
export interface LogFilterOptions {
  start?: string | Date;
  end?: string | Date;
  sender?: string;
  recipient?: string;
  limit?: number;
  page?: number;
  offset?: number;
}

/**
 * Domain tracking settings
 */
export interface DomainTrackingSettings {
  open_track?: boolean;
  click_track?: boolean;
  unsub_track?: boolean;
}

/**
 * Domain creation options
 */
export interface CreateDomainOptions {
  domain: string;
  dkim_key_length: 1024 | 2048;
}

/**
 * Credential creation options
 */
export interface CreateCredentialOptions {
  username: string;
}

/**
 * Email message data
 */
export interface EmailMessage {
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

/**
 * Template email message data
 */
export interface TemplateMessage {
  template_guid: string;
  to: string | string[];
  variables?: Record<string, any>;
}

/**
 * Authentication domain setup options
 */
export interface AuthDomainSetupOptions {
  auth_domain?: string;
  dkim_key_length: 1024 | 2048;
}

/**
 * Tracking domain setup options
 */
export interface TrackingDomainSetupOptions {
  tracking_domain: string;
}