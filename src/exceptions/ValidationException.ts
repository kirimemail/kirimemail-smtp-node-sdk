import { ApiException } from './ApiException';

/**
 * Exception thrown when validation fails (400, 422)
 */
export class ValidationException extends ApiException {
  constructor(message: string, errors?: Record<string, string[]>) {
    super(message, 422, errors);
    this.name = 'ValidationException';
  }
}