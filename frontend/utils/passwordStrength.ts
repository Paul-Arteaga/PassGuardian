import { AppThemeColors } from '../constants/Colors';

export type StrengthLevel = 'Weak' | 'Fair' | 'Good' | 'Strong';

export interface PasswordStrengthResult {
  level: StrengthLevel;
  color: string;
  score: number;
  feedback: string;
}

const COMMON_PASSWORDS = [
  '123', '1234', '12345', '123456', '1234567', '12345678', '123456789',
  '0000', '0000000', '111111', '1111111', '000000', 'qwerty', 'qwerty123',
  'password', 'password1', 'pass', 'pass123', 'abc123', 'letmein',
  'admin', 'login', 'welcome', 'iloveyou', 'monkey', 'master', 'dragon',
  'sunshine', 'princess', 'baseball', 'football', 'shadow', 'superman',
];

function hasSequential(password: string): boolean {
  const p = password.toLowerCase();
  for (let i = 0; i < p.length - 2; i++) {
    const a = p.charCodeAt(i);
    const b = p.charCodeAt(i + 1);
    const c = p.charCodeAt(i + 2);
    if (b === a + 1 && c === b + 1) return true;
    if (b === a - 1 && c === b - 1) return true;
  }
  return false;
}

function hasRepeated(password: string): boolean {
  return /(.)\1{3,}/.test(password);
}

export function evaluatePasswordStrength(
  password: string,
  Colors: AppThemeColors
): PasswordStrengthResult {
  if (!password) {
    return { level: 'Weak', color: Colors.error, score: 0, feedback: 'Ingresa una contraseña' };
  }

  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    return {
      level: 'Weak',
      color: Colors.error,
      score: 5,
      feedback: 'Contraseña muy común — fácil de adivinar',
    };
  }

  let score = 0;
  let feedback = '';

  if (password.length >= 6) score += 10;
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^a-zA-Z0-9]/.test(password)) score += 20;

  const varietyCount = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(r =>
    r.test(password)
  ).length;
  if (varietyCount >= 3) score += 5;
  if (varietyCount >= 4) score += 5;

  if (hasSequential(password)) {
    score = Math.max(0, score - 20);
    feedback = 'Evita caracteres seguidos (abc, 123, 321)';
  }
  if (hasRepeated(password)) {
    score = Math.max(0, score - 15);
    if (!feedback) feedback = 'Evita caracteres repetidos (aaaa, 1111)';
  }

  score = Math.min(score, 100);

  if (score < 30) {
    return {
      level: 'Weak',
      color: Colors.error,
      score,
      feedback: feedback || 'Muy débil — agrega más caracteres y variedad',
    };
  }
  if (score < 55) {
    return {
      level: 'Fair',
      color: Colors.warning,
      score,
      feedback: feedback || 'Regular — agrega símbolos o mayúsculas',
    };
  }
  if (score < 80) {
    return {
      level: 'Good',
      color: Colors.success,
      score,
      feedback: feedback || 'Buena — considera agregar más variedad',
    };
  }
  return {
    level: 'Strong',
    color: Colors.accent,
    score,
    feedback: '¡Contraseña fuerte!',
  };
}
