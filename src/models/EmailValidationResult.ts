import { ApiResponse } from '../types';

export interface EmailValidationResultData {
  email: string;
  is_valid: boolean;
  error: string | null;
  warnings: string[];
  cached: boolean;
  validated_at: string;
  is_spamtrap: boolean;
  spamtrap_score: number;
}

export class EmailValidationResult {
  public email: string;
  public isValid: boolean;
  public error: string | null;
  public warnings: string[];
  public cached: boolean;
  public validatedAt: string;
  public isSpamtrap: boolean;
  public spamtrapScore: number;

  constructor(data: EmailValidationResultData) {
    this.email = data.email;
    this.isValid = data.is_valid;
    this.error = data.error;
    this.warnings = data.warnings || [];
    this.cached = data.cached;
    this.validatedAt = data.validated_at;
    this.isSpamtrap = data.is_spamtrap;
    this.spamtrapScore = data.spamtrap_score;
  }

  static fromAPI(data: any): EmailValidationResult {
    return new EmailValidationResult(data);
  }

  toJSON(): EmailValidationResultData {
    return {
      email: this.email,
      is_valid: this.isValid,
      error: this.error,
      warnings: this.warnings,
      cached: this.cached,
      validated_at: this.validatedAt,
      is_spamtrap: this.isSpamtrap,
      spamtrap_score: this.spamtrapScore,
    };
  }
}
