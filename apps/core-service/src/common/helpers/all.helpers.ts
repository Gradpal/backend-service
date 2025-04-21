import { User } from '@core-service/modules/user/entities/user.entity';
import * as bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Normalize the skills data: ensure it's always an array
export function normalizeArray<T>(array: T[]) {
  return Array.isArray(array) ? array : array ? [array] : [];
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
