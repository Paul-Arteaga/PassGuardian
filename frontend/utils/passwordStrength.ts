import { AppThemeColors } from '../constants/Colors';

export type StrengthLevel = 'Weak' | 'Fair' | 'Good' | 'Strong';

export interface PasswordStrengthResult {
  level: StrengthLevel;
  color: string;
  score: number; // 0-100
}

export function evaluatePasswordStrength(password: string, Colors: AppThemeColors): PasswordStrengthResult {
  if (!password) {
    return { level: 'Weak', color: Colors.error, score: 0 };
  }

  let score = 0;

  // Length checks
  if (password.length >= 6) score += 10;
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // Character variety
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^a-zA-Z0-9]/.test(password)) score += 20;

  // Bonus for mixing
  const varietyCount = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(r => r.test(password)).length;
  if (varietyCount >= 3) score += 5;
  if (varietyCount >= 4) score += 5;

  score = Math.min(score, 100);

  if (score < 30) return { level: 'Weak', color: Colors.error, score };
  if (score < 55) return { level: 'Fair', color: Colors.warning, score };
  if (score < 80) return { level: 'Good', color: Colors.success, score };
  return { level: 'Strong', color: Colors.accent, score };
}
