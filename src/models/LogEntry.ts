/**
 * Email Log Entry model
 */

/**
 * SMTP Event Constants
 */
export const SMTP_EVENTS = {
  QUEUED: 'queued',
  SEND: 'send',
  DELIVERED: 'delivered',
  BOUNCED: 'bounced',
  FAILED: 'failed',
  PERMANENT_FAIL: 'permanent_fail',
  OPENED: 'opened',
  CLICKED: 'clicked',
  UNSUBSCRIBED: 'unsubscribed',
  TEMP_FAILURE: 'temp_fail',
  DEFERRED: 'deferred',
} as const;

export interface LogEntryData {
  id?: string;
  user_guid?: string;
  user_domain_guid?: string;
  user_smtp_guid?: string;
  webhook_guid?: string;
  message_guid?: string;
  server_message_guid?: string;
  type?: string;
  sender?: string;
  sender_domain?: string;
  sender_ip?: string;
  recipient?: string;
  recipient_domain?: string;
  recipient_ip?: string;
  recipient_hash?: string;
  server?: string;
  event_type?: string;
  event?: string;
  event_detail?: string;
  tags?: string;
  subject?: string;
  created_at?: number;
  sending_at?: number;
  delivered_at?: number;
  in_date?: number;
  in_date_hour?: number;
  in_year_week?: number;
  in_year_month?: number;
  in_year?: number;
}

export class LogEntry {
  public readonly id?: string;
  public readonly userGuid?: string;
  public readonly userDomainGuid?: string;
  public readonly userSmtpGuid?: string;
  public readonly webhookGuid?: string;
  public readonly messageGuid?: string;
  public readonly serverMessageGuid?: string;
  public readonly type?: string;
  public readonly sender?: string;
  public readonly senderDomain?: string;
  public readonly senderIp?: string;
  public readonly recipient?: string;
  public readonly recipientDomain?: string;
  public readonly recipientIp?: string;
  public readonly recipientHash?: string;
  public readonly server?: string;
  public readonly eventType?: string;
  public readonly event?: string;
  public readonly eventDetail?: string;
  public readonly tags?: string;
  public readonly subject?: string;
  public readonly createdAt?: number;
  public readonly sendingAt?: number;
  public readonly deliveredAt?: number;
  public readonly inDate?: number;
  public readonly inDateHour?: number;
  public readonly inYearWeek?: number;
  public readonly inYearMonth?: number;
  public readonly inYear?: number;

  constructor(data: LogEntryData = {}) {
    this.id = data.id;
    this.userGuid = data.user_guid;
    this.userDomainGuid = data.user_domain_guid;
    this.userSmtpGuid = data.user_smtp_guid;
    this.webhookGuid = data.webhook_guid;
    this.messageGuid = data.message_guid;
    this.serverMessageGuid = data.server_message_guid;
    this.type = data.type;
    this.sender = data.sender;
    this.senderDomain = data.sender_domain;
    this.senderIp = data.sender_ip;
    this.recipient = data.recipient;
    this.recipientDomain = data.recipient_domain;
    this.recipientIp = data.recipient_ip;
    this.recipientHash = data.recipient_hash;
    this.server = data.server;
    this.eventType = data.event_type;
    this.event = data.event;
    this.eventDetail = data.event_detail;
    this.tags = data.tags;
    this.subject = data.subject;
    this.createdAt = data.created_at;
    this.sendingAt = data.sending_at;
    this.deliveredAt = data.delivered_at;
    this.inDate = data.in_date;
    this.inDateHour = data.in_date_hour;
    this.inYearWeek = data.in_year_week;
    this.inYearMonth = data.in_year_month;
    this.inYear = data.in_year;
  }

  /**
   * Get created date as Date object
   */
  public getCreatedDate(): Date | null {
    return this.createdAt ? new Date(this.createdAt * 1000) : null;
  }

  /**
   * Get sending date as Date object
   */
  public getSendingDate(): Date | null {
    return this.sendingAt ? new Date(this.sendingAt * 1000) : null;
  }

  /**
   * Get delivered date as Date object
   */
  public getDeliveredDate(): Date | null {
    return this.deliveredAt ? new Date(this.deliveredAt * 1000) : null;
  }

  /**
   * Check if this is a delivery event
   */
  public isDeliveryEvent(): boolean {
    return this.eventType === SMTP_EVENTS.DELIVERED;
  }

  /**
   * Check if this is a bounce event
   */
  public isBounceEvent(): boolean {
    return this.eventType === SMTP_EVENTS.BOUNCED;
  }

  /**
   * Check if this is an open event
   */
  public isOpenEvent(): boolean {
    return this.eventType === SMTP_EVENTS.OPENED;
  }

  /**
   * Check if this is a click event
   */
  public isClickEvent(): boolean {
    return this.eventType === SMTP_EVENTS.CLICKED;
  }

  /**
   * Check if this is a send event
   */
  public isSendEvent(): boolean {
    return this.eventType === SMTP_EVENTS.SEND || this.eventType === SMTP_EVENTS.QUEUED;
  }

  /**
   * Check if this is a failed event
   */
  public isFailedEvent(): boolean {
    return this.eventType === SMTP_EVENTS.FAILED ||
           this.eventType === SMTP_EVENTS.PERMANENT_FAIL ||
           this.eventType === SMTP_EVENTS.TEMP_FAILURE;
  }

  /**
   * Check if this is a deferred event
   */
  public isDeferredEvent(): boolean {
    return this.eventType === SMTP_EVENTS.DEFERRED;
  }

  /**
   * Check if this is an unsubscribe event
   */
  public isUnsubscribeEvent(): boolean {
    return this.eventType === SMTP_EVENTS.UNSUBSCRIBED;
  }

  /**
   * Check if this is a tracking event (open/click)
   */
  public isTrackingEvent(): boolean {
    return this.isOpenEvent() || this.isClickEvent() || this.isUnsubscribeEvent();
  }

  /**
   * Check if this is an error event
   */
  public isErrorEvent(): boolean {
    return !!(this.eventType?.includes('failed') || this.eventType?.includes('bounce') || this.eventType?.includes('error'));
  }

  /**
   * Get event category
   */
  public getEventCategory(): 'delivery' | 'tracking' | 'bounce' | 'send' | 'failed' | 'deferred' | 'other' {
    if (this.isDeliveryEvent()) return 'delivery';
    if (this.isTrackingEvent()) return 'tracking';
    if (this.isBounceEvent()) return 'bounce';
    if (this.isFailedEvent()) return 'failed';
    if (this.isDeferredEvent()) return 'deferred';
    if (this.isSendEvent()) return 'send';
    return 'other';
  }

  /**
   * Get response information from event and event_detail
   */
  public getResponseInfo(): {
    code?: string;
    message?: string;
  } {
    return {
      code: this.event,
      message: this.eventDetail,
    };
  }

  /**
   * Get sender information
   */
  public getSenderInfo(): {
    sender?: string;
    senderDomain?: string;
    senderIp?: string;
  } {
    return {
      sender: this.sender,
      senderDomain: this.senderDomain,
      senderIp: this.senderIp,
    };
  }

  /**
   * Get recipient information
   */
  public getRecipientInfo(): {
    recipient?: string;
    recipientDomain?: string;
    recipientIp?: string;
    recipientHash?: string;
  } {
    return {
      recipient: this.recipient,
      recipientDomain: this.recipientDomain,
      recipientIp: this.recipientIp,
      recipientHash: this.recipientHash,
    };
  }

  /**
   * Convert to plain object
   */
  public toJSON(): LogEntryData {
    return {
      id: this.id,
      user_guid: this.userGuid,
      user_domain_guid: this.userDomainGuid,
      user_smtp_guid: this.userSmtpGuid,
      webhook_guid: this.webhookGuid,
      message_guid: this.messageGuid,
      server_message_guid: this.serverMessageGuid,
      type: this.type,
      sender: this.sender,
      sender_domain: this.senderDomain,
      sender_ip: this.senderIp,
      recipient: this.recipient,
      recipient_domain: this.recipientDomain,
      recipient_ip: this.recipientIp,
      recipient_hash: this.recipientHash,
      server: this.server,
      event_type: this.eventType,
      event: this.event,
      event_detail: this.eventDetail,
      tags: this.tags,
      subject: this.subject,
      created_at: this.createdAt,
      sending_at: this.sendingAt,
      delivered_at: this.deliveredAt,
      in_date: this.inDate,
      in_date_hour: this.inDateHour,
      in_year_week: this.inYearWeek,
      in_year_month: this.inYearMonth,
      in_year: this.inYear,
    };
  }

  /**
   * Create LogEntry from API response
   */
  public static fromAPI(data: any): LogEntry {
    return new LogEntry(data);
  }

  /**
   * Convert to string representation
   */
  public toString(): string {
    const date = this.getCreatedDate();
    const dateStr = date ? date.toISOString() : 'Unknown';
    return `LogEntry(id=${this.id}, type=${this.eventType}, created=${dateStr}, recipient=${this.recipient})`;
  }
}