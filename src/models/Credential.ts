/**
 * SMTP Credential model
 */
export interface CredentialData {
  id?: number;
  user_smtp_guid?: string;
  username?: string;
  is_verified?: boolean;
  status?: boolean;
  is_deleted?: boolean;
  created_at?: number;
  modified_at?: number;
  deleted_at?: number;
  last_password_changed?: number;
  password?: string;
  strength_info?: Record<string, any>;
  remote_synced?: boolean;
}

export class Credential {
  public readonly id?: number;
  public readonly userSmtpGuid?: string;
  public readonly username?: string;
  public readonly isVerified?: boolean;
  public readonly status?: boolean;
  public readonly isDeleted?: boolean;
  public readonly createdAt?: number;
  public readonly modifiedAt?: number;
  public readonly deletedAt?: number;
  public readonly lastPasswordChanged?: number;
  public password?: string;
  public strengthInfo?: Record<string, any>;
  public remoteSynced?: boolean;

  constructor(data: CredentialData = {}) {
    this.id = data.id;
    this.userSmtpGuid = data.user_smtp_guid;
    this.username = data.username;
    this.isVerified = data.is_verified;
    this.status = data.status;
    this.isDeleted = data.is_deleted;
    this.createdAt = data.created_at;
    this.modifiedAt = data.modified_at;
    this.deletedAt = data.deleted_at;
    this.lastPasswordChanged = data.last_password_changed;
    this.password = data.password;
    this.strengthInfo = data.strength_info;
    this.remoteSynced = data.remote_synced;
  }

  /**
   * Get created date as Date object
   */
  public getCreatedAtDate(): Date | null {
    return this.createdAt ? new Date(this.createdAt * 1000) : null;
  }

  /**
   * Get modified date as Date object
   */
  public getModifiedDate(): Date | null {
    return this.modifiedAt ? new Date(this.modifiedAt * 1000) : null;
  }

  /**
   * Get deleted date as Date object
   */
  public getDeletedDate(): Date | null {
    return this.deletedAt ? new Date(this.deletedAt * 1000) : null;
  }

  /**
   * Get last password changed date as Date object
   */
  public getLastPasswordChangedDate(): Date | null {
    return this.lastPasswordChanged ? new Date(this.lastPasswordChanged * 1000) : null;
  }

  /**
   * Check if credential is active (not deleted and has status)
   */
  public isActive(): boolean {
    return !this.isDeleted && !!this.status;
  }

  /**
   * Check if credential is verified
   */
  public isActiveAndVerified(): boolean {
    return this.isActive() && !!this.isVerified;
  }

  /**
   * Set password (typically used for create/reset responses)
   */
  public setPassword(password: string): void {
    this.password = password;
  }

  /**
   * Set strength info (typically used for password reset responses)
   */
  public setStrengthInfo(strengthInfo: Record<string, any>): void {
    this.strengthInfo = strengthInfo;
  }

  /**
   * Set remote sync status
   */
  public setRemoteSynced(remoteSynced: boolean): void {
    this.remoteSynced = remoteSynced;
  }

  /**
   * Convert to plain object
   */
  public toJSON(): CredentialData {
    return {
      id: this.id,
      user_smtp_guid: this.userSmtpGuid,
      username: this.username,
      is_verified: this.isVerified,
      status: this.status,
      is_deleted: this.isDeleted,
      created_at: this.createdAt,
      modified_at: this.modifiedAt,
      deleted_at: this.deletedAt,
      last_password_changed: this.lastPasswordChanged,
      password: this.password,
      strength_info: this.strengthInfo,
      remote_synced: this.remoteSynced,
    };
  }

  /**
   * Create Credential from API response
   */
  public static fromAPI(data: any): Credential {
    return new Credential(data);
  }

  /**
   * Convert to string representation
   */
  public toString(): string {
    return `Credential(id=${this.id}, username=${this.username}, verified=${this.isVerified})`;
  }
}