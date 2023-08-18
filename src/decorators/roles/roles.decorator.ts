import { SetMetadata } from '@nestjs/common';

export const Roles = (...args: string[]) => {
  console.log(`[Roles Decorator] set role to ${args}`);
  return SetMetadata('roles', args);
};
