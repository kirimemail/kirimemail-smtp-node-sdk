export class Quota {
  public readonly current_quota: number;
  public readonly max_quota: number;
  public readonly usage_percentage: number;

  constructor(data: QuotaData) {
    this.current_quota = data.current_quota;
    this.max_quota = data.max_quota;
    this.usage_percentage = data.usage_percentage;
  }

  public static fromAPI(data: any): Quota {
    return new Quota({
      current_quota: data.current_quota,
      max_quota: data.max_quota,
      usage_percentage: data.usage_percentage,
    });
  }

  public toJSON(): QuotaData {
    return {
      current_quota: this.current_quota,
      max_quota: this.max_quota,
      usage_percentage: this.usage_percentage,
    };
  }
}

export type QuotaData = {
  current_quota: number;
  max_quota: number;
  usage_percentage: number;
};
