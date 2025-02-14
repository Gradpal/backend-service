import { ApiResponseOptions } from '@nestjs/swagger';
import { ErrorResponse } from '../dtos/shared.dto';
import { isEqual } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

export const _errors = (
  errorCodeObject: ErrorResponse[],
): ApiResponseOptions => {
  let descriptionString = 'Error codes: ';

  errorCodeObject.map((item) => {
    descriptionString += `${item.code} , `;
  });

  return { description: descriptionString };
};
type PaginateOptions = { page: number; limit: number; total: number };
export const paginator = ({ page, limit, total }: PaginateOptions) => {
  const lastPage = Math.ceil(total / limit);

  return {
    total,
    lastPage,
    currentPage: page,
    perPage: limit,
    prev: page > 1 ? page - 1 : null,
    next: page < lastPage ? page + 1 : null,
  };
};
export function objectExistsInJson<T>(jsonArray: T[], object: T): boolean {
  return jsonArray.some((exp) => isEqual(exp, object));
}
export function addObjectInJson<T>(jsonArray: T[], object: T) {
  let json: T[] = jsonArray || [];
  if (!objectExistsInJson(json, object)) {
    json = [...json, object];
  }
  return json;
}
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export function getFileType(file: Express.Multer.File): string {
  return file.mimetype;
}
export function generateUUID(): string {
  return uuidv4();
}
