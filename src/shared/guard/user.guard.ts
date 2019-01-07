import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector = new Reflector()) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    console.log('roles', user.roles);
    const hasRole =
      user && user.roles && user.roles.some(role => roles.includes(role));
    console.log('user', user);
    console.log('hasRole', hasRole);
    return hasRole;
  }
}
