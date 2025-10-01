import { SmtpClient } from '../client/SmtpClient';
import { LogEntry } from '../models/LogEntry';
import { Pagination } from '../models/Pagination';
import { ApiResponse, RequestOptions, LogFilterOptions } from '../types';
import { ApiException } from '../exceptions';

/**
 * API class for retrieving email logs
 */
export class LogsApi {
  private client: SmtpClient;

  constructor(client: SmtpClient) {
    this.client = client;
  }

  /**
   * Get logs for a domain using basic auth endpoints
   *
   * @param domain Domain name
   * @param options Log filtering options
   * @returns Promise resolving to logs with pagination
   * @throws ApiException
   */
  public async getLogs(
    domain: string,
    options: LogFilterOptions = {}
  ): Promise<{
    data: LogEntry[];
    count: number;
    offset: number;
    limit: number;
    pagination?: Pagination;
  }> {
    try {
      // Convert Date objects to ISO strings if needed
      const params = { ...options };
      if (params.start instanceof Date) {
        params.start = params.start.toISOString();
      }
      if (params.end instanceof Date) {
        params.end = params.end.toISOString();
      }

      const response = await this.client.get(`api/domains/${domain}/log`, params);

      const logs = response.data?.data || [];
      const logEntries = logs.map((logData: any) => LogEntry.fromAPI(logData));

      const pagination = response.pagination ?
        new Pagination(response.pagination) : undefined;

      return {
        data: logEntries,
        count: response.count || (response.data?.count || 0),
        offset: response.offset || (response.data?.offset || 0),
        limit: response.limit || (response.data?.limit || 1000),
        pagination,
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to get domain logs');
    }
  }

  /**
   * Get logs for a specific message using basic auth endpoints
   *
   * @param domain Domain name
   * @param messageGuid Message GUID
   * @returns Promise resolving to message logs
   * @throws ApiException
   */
  public async getLogsByMessage(
    domain: string,
    messageGuid: string
  ): Promise<{
    data: LogEntry[];
  }> {
    try {
      const response = await this.client.get(`api/domains/${domain}/log/${messageGuid}`);

      const logs = response.data?.data || [];
      const logEntries = logs.map((logData: any) => LogEntry.fromAPI(logData));

      return {
        data: logEntries,
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to get message logs');
    }
  }

  /**
   * Get logs by date range for a domain
   *
   * @param domain Domain name
   * @param startDate Start date (Date or ISO string)
   * @param endDate End date (Date or ISO string)
   * @param options Additional log filtering options
   * @returns Promise resolving to logs with pagination
   * @throws ApiException
   */
  public async getLogsByDateRange(
    domain: string,
    startDate: string | Date,
    endDate: string | Date,
    options: Omit<LogFilterOptions, 'start' | 'end'> = {}
  ): Promise<{
    data: LogEntry[];
    count: number;
    offset: number;
    limit: number;
    pagination?: Pagination;
  }> {
    return this.getLogs(domain, {
      ...options,
      start: startDate,
      end: endDate,
    });
  }

  /**
   * Stream logs for a domain (async generator)
   *
   * @param domain Domain name
   * @param options Log filtering options
   * @returns AsyncGenerator yielding LogEntry objects
   * @throws ApiException
   */
  public async *streamLogs(
    domain: string,
    options: LogFilterOptions = {}
  ): AsyncGenerator<LogEntry> {
    try {
      // Convert Date objects to ISO strings if needed
      const params = { ...options };
      if (params.start instanceof Date) {
        params.start = params.start.toISOString();
      }
      if (params.end instanceof Date) {
        params.end = params.end.toISOString();
      }

      const stream = this.client.stream(`/api/domains/${domain}/log`, params);

      for await (const logData of stream) {
        yield LogEntry.fromAPI(logData);
      }
    } catch (error) {
      throw this.handleError(error, 'Failed to stream domain logs');
    }
  }

  /**
   * Handle errors and add context
   */
  private handleError(error: any, _defaultMessage: string): never {
    if (error instanceof ApiException) {
      throw error;
    }

    // Re-throw with additional context
    throw new ApiException(`${error.message}`);
  }
}