import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.get<UserRole[]>(ROLES_KEY, ctx.getHandler()) || this.reflector.get<UserRole[]>(ROLES_KEY, ctx.getClass());
    if (!roles || roles.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user || !user.role) return false;
    if (!roles.includes(user.role)) throw new ForbiddenException('Insufficient role');
    return true;
  }
}