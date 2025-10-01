import { ApiException } from './ApiException';

/**
 * Exception thrown when a resource is not found (404)
 */
export class NotFoundException extends ApiException {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundException';
  }
}