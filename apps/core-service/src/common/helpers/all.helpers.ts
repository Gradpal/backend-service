import { User } from '@core-service/modules/user/entities/user.entity';
import * as bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Normalize the skills data: ensure it's always an array
export function normalizeArray<T>(array: T[]) {
  return Array.isArray(array) ? array : array ? [array] : [];
}

