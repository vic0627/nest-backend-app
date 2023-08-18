import { applyDecorators, UseGuards } from '@nestjs/common';
import { Roles } from '../roles/roles.decorator';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RoleGuard } from 'src/guards/role/role.guard';

export const Auth = (...roles: string[]) => {
  console.log(`[Auth Decorator] Combine Roles and UseGuards`);
  return applyDecorators(Roles(...roles), UseGuards(AuthGuard, RoleGuard));
};
