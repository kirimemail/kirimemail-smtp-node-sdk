/**
 * Email Suppression model
 */
export interface SuppressionData {
  id?: number;
  user_guid?: string;
  user_domain_guid?: string;
  recipient?: string;
  type?: string;
  reason?: string;
  description?: string;
  source?: string;
  message_guid?: string;
  created_at?: number;
  updated_at?: number;
}

export class Suppression {
  public readonly id?: number;
  public readonly userGuid?: string;
  public readonly userDomainGuid?: string;
  public readonly recipient?: string;
  public readonly type?: string;
  public readonly reason?: string;
  public readonly description?: string;
  public readonly source?: string;
  public readonly messageGuid?: string;
  public readonly createdAt?: number;
  public readonly updatedAt?: number;

  constructor(data: SuppressionData = {}) {
    this.id = data.id;
    this.userGuid = data.user_guid;
    this.userDomainGuid = data.user_domain_guid;
    this.recipient = data.recipient;
    this.type = data.type;
    this.reason = data.reason;
    this.description = data.description;
    this.source = data.source;
    this.messageGuid = data.message_guid;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  /**
   * Get created date as Date object
   */
  public getCreatedDate(): Date | null {
    return this.createdAt ? new Date(this.createdAt * 1000) : null;
  }

  /**
   * Get updated date as Date object
   */
  public getUpdatedDate(): Date | null {
    return this.updatedAt ? new Date(this.updatedAt * 1000) : null;
  }

  /**
   * Check if this is a bounce suppression
   */
  public isBounce(): boolean {
    return this.type === 'bounce' || this.type === 'hard_bounce' || this.type === 'soft_bounce';
  }

  /**
   * Check if this is a spam complaint suppression
   */
  public isSpamComplaint(): boolean {
    return this.type === 'spam_complaint' || this.type === 'spam';
  }

  /**
   * Check if this is an unsubscribe suppression
   */
  public isUnsubscribe(): boolean {
    return this.type === 'unsubscribe' || this.type === 'unsub';
  }

  /**
   * Check if this is a manual suppression
   */
  public isManual(): boolean {
    return this.source === 'manual' || this.source === 'admin';
  }

  /**
   * Check if this is an automatic suppression
   */
  public isAutomatic(): boolean {
    return this.source === 'automatic' || this.source === 'system';
  }

  /**
   * Get suppression category
   */
  public getCategory(): 'bounce' | 'spam' | 'unsubscribe' | 'other' {
    if (this.isBounce()) return 'bounce';
    if (this.isSpamComplaint()) return 'spam';
    if (this.isUnsubscribe()) return 'unsubscribe';
    return 'other';
  }

  /**
   * Check if suppression is permanent (hard bounce, spam complaint)
   */
  public isPermanent(): boolean {
    return this.type === 'hard_bounce' || this.isSpamComplaint();
  }

  /**
   * Check if suppression is temporary (soft bounce)
   */
  public isTemporary(): boolean {
    return this.type === 'soft_bounce';
  }

  /**
   * Get formatted recipient email
   */
  public getFormattedRecipient(): string {
    return this.recipient || '';
  }

  /**
   * Get suppression description with reason
   */
  public getFullDescription(): string {
    if (this.description) return this.description;
    if (this.reason) return this.reason;
    return `${this.type} suppression`;
  }

  /**
   * Get suppression severity level
   */
  public getSeverity(): 'high' | 'medium' | 'low' {
    if (this.isSpamComplaint() || this.type === 'hard_bounce') return 'high';
    if (this.type === 'soft_bounce') return 'medium';
    return 'low';
  }

  /**
   * Check if suppression can be removed (temporary suppressions only)
   */
  public canBeRemoved(): boolean {
    return this.isTemporary() || this.isManual();
  }

  /**
   * Get time since creation
   */
  public getTimeSinceCreation(): {
    days: number;
    hours: number;
    minutes: number;
  } | null {
    if (!this.createdAt) return null;

    const now = Math.floor(Date.now() / 1000);
    const diff = now - this.createdAt;

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);

    return { days, hours, minutes };
  }

  /**
   * Convert to plain object
   */
  public toJSON(): SuppressionData {
    return {
      id: this.id,
      user_guid: this.userGuid,
      user_domain_guid: this.userDomainGuid,
      recipient: this.recipient,
      type: this.type,
      reason: this.reason,
      description: this.description,
      source: this.source,
      message_guid: this.messageGuid,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  /**
   * Create Suppression from API response
   */
  public static fromAPI(data: any): Suppression {
    return new Suppression(data);
  }

  /**
   * Convert to string representation
   */
  public toString(): string {
    const date = this.getCreatedDate();
    const dateStr = date ? date.toISOString() : 'Unknown';
    return `Suppression(id=${this.id}, type=${this.type}, recipient=${this.recipient}, created=${dateStr})`;
  }
}