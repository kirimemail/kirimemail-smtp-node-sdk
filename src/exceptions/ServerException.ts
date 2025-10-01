import { ApiException } from './ApiException';

/**
 * Exception thrown when a server error occurs (500+)
 */
export class ServerException extends ApiException {
  constructor(message: string) {
    super(message, 500);
    this.name = 'ServerException';
  }
}