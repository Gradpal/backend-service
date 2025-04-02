import { SetMetadata } from '@nestjs/common';
import { EUserRole } from '../../user/enums/user-role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: EUserRole[]) => SetMetadata(ROLES_KEY, roles);
