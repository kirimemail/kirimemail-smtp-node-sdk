/**
 * Base exception class for all API-related errors
 */
export class ApiException extends Error {
  public readonly statusCode?: number;
  public readonly errors?: Record<string, string[]>;

  constructor(message: string, statusCode?: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiException';
    this.statusCode = statusCode;
    this.errors = errors;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiException);
    }
  }

  /**
   * Check if the exception has validation errors
   */
  public hasErrors(): boolean {
    return !!this.errors && Object.keys(this.errors).length > 0;
  }

  /**
   * Get all validation errors as a flat array
   */
  public getErrorMessages(): string[] {
    if (!this.errors) return [];

    return Object.values(this.errors).flat();
  }

  /**
   * Get error message for a specific field
   */
  public getErrorForField(field: string): string[] {
    return this.errors?.[field] || [];
  }

  public toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      errors: this.errors,
      stack: this.stack,
    };
  }
}