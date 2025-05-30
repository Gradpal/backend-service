import { User } from '@core-service/modules/user/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { UNIVERSITY_DOMAINS } from '../constants/data.constants';
import { AcademicEmailVerificationDTO } from '@core-service/modules/user/dto/create-user.dto';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Normalize the skills data: ensure it's always an array
export function normalizeArray<T>(array: T[]) {
  return Array.isArray(array)
    ? array
    : array
      ? (array as string).split(',')
      : [];
}

export function generateAlphaNumericCode(length) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

export function generateRandomOTP(): number {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns { response: 'yes', message: '<university name> verified' } if found,
 * or { response: 'no', message: 'email is not verified' } if not.
 */
export function verifyAcademicEmailByDomain(
  email: string,
): AcademicEmailVerificationDTO {
  if (!email) return { isValid: false, message: 'email is not verified' };
  const emailDomain = email.split('@')[1]?.toLowerCase();
  if (!emailDomain) return { isValid: false, message: 'email is not verified' };

  const domains = UNIVERSITY_DOMAINS.flatMap((uni) => uni.domains);
  if (domains && domains.includes(emailDomain)) {
    const universityName = UNIVERSITY_DOMAINS.find((uni) =>
      uni?.domains?.includes(emailDomain),
    )?.name;
    return {
      isValid: true,
      message: `${universityName} verified`,
    };
  }
  return { isValid: false, message: 'email is not verified' };
}
