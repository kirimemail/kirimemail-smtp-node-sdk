import { Credential } from '../../src/models/Credential';
import { Domain } from '../../src/models/Domain';
import { Pagination } from '../../src/models/Pagination';
import { LogEntry } from '../../src/models/LogEntry';
import { Suppression } from '../../src/models/Suppression';

describe('Models', () => {
  describe('Credential', () => {
    it('should create credential with default values', () => {
      const credential = new Credential();
      expect(credential).toBeInstanceOf(Credential);
      expect(credential.id).toBeUndefined();
      expect(credential.username).toBeUndefined();
    });

    it('should create credential with provided data', () => {
      const data = {
        id: 1,
        username: 'testuser',
        is_verified: true,
        status: true,
      };
      const credential = new Credential(data);
      expect(credential.id).toBe(1);
      expect(credential.username).toBe('testuser');
      expect(credential.isVerified).toBe(true);
      expect(credential.status).toBe(true);
    });

    it('should handle API response conversion', () => {
      const apiData = {
        id: 1,
        user_smtp_guid: 'guid-123',
        username: 'testuser',
        is_verified: true,
        status: true,
        created_at: 1609459200,
      };
      const credential = Credential.fromAPI(apiData);
      expect(credential.userSmtpGuid).toBe('guid-123');
      expect(credential.getCreatedAtDate()).toBeInstanceOf(Date);
    });

    it('should handle empty API data', () => {
      const credential = Credential.fromAPI({});
      expect(credential).toBeInstanceOf(Credential);
      expect(credential.id).toBeUndefined();
    });

    it('should provide meaningful string representation', () => {
      const credential = new Credential({
        id: 1,
        username: 'testuser',
        is_verified: true,
      });
      const str = credential.toString();
      expect(str).toContain('testuser');
      expect(str).toContain('1');
    });
  });

  describe('Domain', () => {
    it('should create domain with default values', () => {
      const domain = new Domain();
      expect(domain).toBeInstanceOf(Domain);
      expect(domain.domain).toBeUndefined();
    });

    it('should create domain with provided data', () => {
      const data = {
        domain: 'example.com',
        is_verified: true,
      };
      const domain = new Domain(data);
      expect(domain.domain).toBe('example.com');
      expect(domain.isVerified).toBe(true);
    });

    it('should handle API response conversion', () => {
      const apiData = {
        domain: 'example.com',
        is_verified: true,
        dkim_public_key: 'public-key',
        created_at: 1609459200,
      };
      const domain = Domain.fromAPI(apiData);
      expect(domain.domain).toBe('example.com');
      expect(domain.dkimPublicKey).toBe('public-key');
      expect(domain.getCreatedDate()).toBeInstanceOf(Date);
    });

    it('should check verification status', () => {
      const verifiedDomain = new Domain({ is_verified: true });
      const unverifiedDomain = new Domain({ is_verified: false });

      expect(verifiedDomain.isVerified).toBe(true);
      expect(unverifiedDomain.isVerified).toBe(false);
    });
  });

  describe('Pagination', () => {
    const mockData = {
      total: 100,
      per_page: 10,
      current_page: 3,
      last_page: 10,
    };

    it('should create pagination with default values', () => {
      const pagination = new Pagination();
      expect(pagination).toBeInstanceOf(Pagination);
      expect(pagination.total).toBeUndefined();
    });

    it('should create pagination with provided data', () => {
      const pagination = new Pagination(mockData);
      expect(pagination.total).toBe(100);
      expect(pagination.perPage).toBe(10);
      expect(pagination.currentPage).toBe(3);
      expect(pagination.lastPage).toBe(10);
    });

    it('should handle API response conversion', () => {
      const pagination = Pagination.fromAPI(mockData);
      expect(pagination.total).toBe(100);
      expect(pagination.perPage).toBe(10);
    });

    it('should check pagination validity', () => {
      const validPagination = new Pagination(mockData);
      const invalidPagination = new Pagination({ total: 100 });

      expect(validPagination.isValid()).toBe(true);
      expect(invalidPagination.isValid()).toBe(false);
    });

    it('should navigate pages correctly', () => {
      const pagination = new Pagination(mockData);

      expect(pagination.hasNextPage()).toBe(true);
      expect(pagination.hasPreviousPage()).toBe(true);
      expect(pagination.getNextPage()).toBe(4);
      expect(pagination.getPreviousPage()).toBe(2);
    });

    it('should handle edge cases', () => {
      const firstPage = new Pagination({ ...mockData, current_page: 1 });
      const lastPage = new Pagination({ ...mockData, current_page: 10 });

      expect(firstPage.hasPreviousPage()).toBe(false);
      expect(firstPage.getNextPage()).toBe(2);
      expect(lastPage.hasNextPage()).toBe(false);
      expect(lastPage.getPreviousPage()).toBe(9);
    });

    it('should provide meaningful summary', () => {
      const pagination = new Pagination(mockData);
      const summary = pagination.getSummary();
      expect(summary).toContain('Showing');
      expect(summary).toContain('100 items');
      expect(summary).toContain('page 3 of 10');
    });

    it('should handle invalid pagination data gracefully', () => {
      const invalidPagination = new Pagination();
      expect(invalidPagination.getSummary()).toBe('Invalid pagination data');
    });
  });

  describe('LogEntry', () => {
    it('should create log entry with default values', () => {
      const log = new LogEntry();
      expect(log).toBeInstanceOf(LogEntry);
      expect(log.eventType).toBeUndefined();
    });

    it('should create log entry with provided data', () => {
      const data = {
        id: '1',
        event_type: 'delivered',
        recipient: 'test@example.com',
        created_at: 1609459200,
      };
      const log = new LogEntry(data);
      expect(log.eventType).toBe('delivered');
      expect(log.recipient).toBe('test@example.com');
      expect(log.getCreatedDate()).toBeInstanceOf(Date);
    });

    it('should categorize events correctly', () => {
      const deliveredLog = new LogEntry({ event_type: 'delivered' });
      const bouncedLog = new LogEntry({ event_type: 'bounced' });
      const failedLog = new LogEntry({ event_type: 'failed' });
      const deferredLog = new LogEntry({ event_type: 'deferred' });
      const openedLog = new LogEntry({ event_type: 'opened' });

      expect(deliveredLog.getEventCategory()).toBe('delivery');
      expect(bouncedLog.getEventCategory()).toBe('bounce');
      expect(failedLog.getEventCategory()).toBe('failed');
      expect(deferredLog.getEventCategory()).toBe('deferred');
      expect(openedLog.getEventCategory()).toBe('tracking');
    });
  });

  describe('Suppression', () => {
    it('should create suppression with default values', () => {
      const suppression = new Suppression();
      expect(suppression).toBeInstanceOf(Suppression);
      expect(suppression.recipient).toBeUndefined();
    });

    it('should create suppression with provided data', () => {
      const data = {
        id: 1,
        recipient: 'test@example.com',
        type: 'bounce',
        reason: 'Hard bounce',
        created_at: 1609459200,
      };
      const suppression = new Suppression(data);
      expect(suppression.recipient).toBe('test@example.com');
      expect(suppression.type).toBe('bounce');
      expect(suppression.reason).toBe('Hard bounce');
      expect(suppression.getCreatedDate()).toBeInstanceOf(Date);
    });

    it('should categorize suppressions correctly', () => {
      const bounceSuppression = new Suppression({ type: 'bounce' });
      const unsubscribeSuppression = new Suppression({ type: 'unsubscribe' });
      const complaintSuppression = new Suppression({ type: 'spam_complaint' });

      expect(bounceSuppression.getCategory()).toBe('bounce');
      expect(unsubscribeSuppression.getCategory()).toBe('unsubscribe');
      expect(complaintSuppression.getCategory()).toBe('spam');
    });
  });
});