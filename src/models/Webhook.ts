export interface WebhookData {
  webhook_guid: string;
  user_guid: string;
  user_domain_guid: string;
  user_smtp_guid: string;
  type: 'queued' | 'send' | 'delivered' | 'bounced' | 'failed' | 'permanent_fail' | 'opened' | 'clicked' | 'unsubscribed' | 'temporary_fail' | 'deferred';
  url: string;
  is_deleted: boolean;
  created_at: number;
  modified_at: number;
}

export class Webhook {
  public webhookGuid: string;
  public userGuid: string;
  public userDomainGuid: string;
  public userSmtpGuid: string;
  public type: 'queued' | 'send' | 'delivered' | 'bounced' | 'failed' | 'permanent_fail' | 'opened' | 'clicked' | 'unsubscribed' | 'temporary_fail' | 'deferred';
  public url: string;
  public isDeleted: boolean;
  public createdAt: number;
  public modifiedAt: number;

  constructor(data: WebhookData) {
    this.webhookGuid = data.webhook_guid;
    this.userGuid = data.user_guid;
    this.userDomainGuid = data.user_domain_guid;
    this.userSmtpGuid = data.user_smtp_guid;
    this.type = data.type;
    this.url = data.url;
    this.isDeleted = data.is_deleted;
    this.createdAt = data.created_at;
    this.modifiedAt = data.modified_at;
  }

  static fromAPI(data: any): Webhook {
    return new Webhook(data);
  }

  toJSON(): WebhookData {
    return {
      webhook_guid: this.webhookGuid,
      user_guid: this.userGuid,
      user_domain_guid: this.userDomainGuid,
      user_smtp_guid: this.userSmtpGuid,
      type: this.type,
      url: this.url,
      is_deleted: this.isDeleted,
      created_at: this.createdAt,
      modified_at: this.modifiedAt,
    };
  }
}
