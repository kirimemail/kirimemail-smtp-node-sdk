import { ApiException } from './ApiException';

/**
 * Exception thrown when authentication fails (401, 403)
 */
export class AuthenticationException extends ApiException {
  constructor(message: string) {
    super(message, 401);
    this.name = 'AuthenticationException';
  }
}