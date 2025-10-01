/**
 * Domain model
 */
export interface DomainData {
  id?: number;
  domain?: string;
  user_guid?: string;
  is_verified?: boolean;
  dkim_public_key?: string;
  dkim_selector?: string;
  verification_token?: string;
  spf_record?: string;
  mx_records?: string[];
  dkim_record?: string;
  tracking_domain?: string;
  tracking_cname?: string;
  auth_domain?: string;
  auth_dkim_record?: string;
  auth_spf_record?: string;
  auth_mx_records?: string[];
  open_track?: boolean;
  click_track?: boolean;
  unsub_track?: boolean;
  created_at?: number;
  modified_at?: number;
  verified_at?: number;
}

export class Domain {
  public readonly id?: number;
  public readonly domain?: string;
  public readonly userGuid?: string;
  public readonly isVerified?: boolean;
  public readonly dkimPublicKey?: string;
  public readonly dkimSelector?: string;
  public readonly verificationToken?: string;
  public readonly spfRecord?: string;
  public readonly mxRecords?: string[];
  public readonly dkimRecord?: string;
  public readonly trackingDomain?: string;
  public readonly trackingCname?: string;
  public readonly authDomain?: string;
  public readonly authDkimRecord?: string;
  public readonly authSpfRecord?: string;
  public readonly authMxRecords?: string[];
  public openTrack?: boolean;
  public clickTrack?: boolean;
  public unsubTrack?: boolean;
  public readonly createdAt?: number;
  public readonly modifiedAt?: number;
  public readonly verifiedAt?: number;

  constructor(data: DomainData = {}) {
    this.id = data.id;
    this.domain = data.domain;
    this.userGuid = data.user_guid;
    this.isVerified = data.is_verified;
    this.dkimPublicKey = data.dkim_public_key;
    this.dkimSelector = data.dkim_selector;
    this.verificationToken = data.verification_token;
    this.spfRecord = data.spf_record;
    this.mxRecords = data.mx_records || [];
    this.dkimRecord = data.dkim_record;
    this.trackingDomain = data.tracking_domain;
    this.trackingCname = data.tracking_cname;
    this.authDomain = data.auth_domain;
    this.authDkimRecord = data.auth_dkim_record;
    this.authSpfRecord = data.auth_spf_record;
    this.authMxRecords = data.auth_mx_records || [];
    this.openTrack = data.open_track;
    this.clickTrack = data.click_track;
    this.unsubTrack = data.unsub_track;
    this.createdAt = data.created_at;
    this.modifiedAt = data.modified_at;
    this.verifiedAt = data.verified_at;
  }

  /**
   * Get created date as Date object
   */
  public getCreatedDate(): Date | null {
    return this.createdAt ? new Date(this.createdAt * 1000) : null;
  }

  /**
   * Get modified date as Date object
   */
  public getModifiedDate(): Date | null {
    return this.modifiedAt ? new Date(this.modifiedAt * 1000) : null;
  }

  /**
   * Get verified date as Date object
   */
  public getVerifiedDate(): Date | null {
    return this.verifiedAt ? new Date(this.verifiedAt * 1000) : null;
  }

  /**
   * Check if domain is verified
   */
  public isActive(): boolean {
    return !!this.isVerified;
  }

  /**
   * Check if domain has tracking configured
   */
  public hasTrackingConfigured(): boolean {
    return !!this.trackingDomain && !!this.trackingCname;
  }

  /**
   * Check if domain has authentication domain configured
   */
  public hasAuthDomainConfigured(): boolean {
    return !!this.authDomain && !!this.authDkimRecord;
  }

  /**
   * Get DNS configuration for the domain
   */
  public getDNSConfiguration(): {
    spf?: string;
    mx: string[];
    dkim?: string;
  } {
    return {
      spf: this.spfRecord,
      mx: this.mxRecords || [],
      dkim: this.dkimRecord,
    };
  }

  /**
   * Get authentication domain DNS configuration
   */
  public getAuthDomainDNSConfiguration(): {
    dkim?: string;
    spf?: string;
    mx: string[];
  } {
    return {
      dkim: this.authDkimRecord,
      spf: this.authSpfRecord,
      mx: this.authMxRecords || [],
    };
  }

  /**
   * Get tracking domain DNS configuration
   */
  public getTrackingDomainDNSConfiguration(): {
    cname?: string;
    domain?: string;
  } {
    const result: { cname?: string; domain?: string } = {};
    if (this.trackingCname) result.cname = this.trackingCname;
    if (this.trackingDomain) result.domain = this.trackingDomain;
    return result;
  }

  /**
   * Update tracking settings
   */
  public updateTrackingSettings(settings: {
    open_track?: boolean;
    click_track?: boolean;
    unsub_track?: boolean;
  }): void {
    if (settings.open_track !== undefined) {
      this.openTrack = settings.open_track;
    }
    if (settings.click_track !== undefined) {
      this.clickTrack = settings.click_track;
    }
    if (settings.unsub_track !== undefined) {
      this.unsubTrack = settings.unsub_track;
    }
  }

  /**
   * Get current tracking settings
   */
  public getTrackingSettings(): {
    open_track?: boolean;
    click_track?: boolean;
    unsub_track?: boolean;
  } {
    const result: { open_track?: boolean; click_track?: boolean; unsub_track?: boolean } = {};
    if (this.openTrack !== undefined) result.open_track = this.openTrack;
    if (this.clickTrack !== undefined) result.click_track = this.clickTrack;
    if (this.unsubTrack !== undefined) result.unsub_track = this.unsubTrack;
    return result;
  }

  /**
   * Convert to plain object
   */
  public toJSON(): DomainData {
    return {
      id: this.id,
      domain: this.domain,
      user_guid: this.userGuid,
      is_verified: this.isVerified,
      dkim_public_key: this.dkimPublicKey,
      dkim_selector: this.dkimSelector,
      verification_token: this.verificationToken,
      spf_record: this.spfRecord,
      mx_records: this.mxRecords,
      dkim_record: this.dkimRecord,
      tracking_domain: this.trackingDomain,
      tracking_cname: this.trackingCname,
      auth_domain: this.authDomain,
      auth_dkim_record: this.authDkimRecord,
      auth_spf_record: this.authSpfRecord,
      auth_mx_records: this.authMxRecords,
      open_track: this.openTrack,
      click_track: this.clickTrack,
      unsub_track: this.unsubTrack,
      created_at: this.createdAt,
      modified_at: this.modifiedAt,
      verified_at: this.verifiedAt,
    };
  }

  /**
   * Create Domain from API response
   */
  public static fromAPI(data: any): Domain {
    return new Domain(data);
  }

  /**
   * Convert to string representation
   */
  public toString(): string {
    return `Domain(id=${this.id}, domain=${this.domain}, verified=${this.isVerified})`;
  }
}