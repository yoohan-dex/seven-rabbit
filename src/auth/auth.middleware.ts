import {
  Injectable,
  MiddlewareFunction,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import * as signale from 'signale';
import ERRORS from './constants';
import { AuthService } from './auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}
  resolve(...args: any[]): MiddlewareFunction {
    return async (req, __, next) => {
      const { 'x-wx-skey': skey } = req.headers;
      if (!skey) throw new UnauthorizedException(ERRORS.ERR_SKEY_INVALID);

      signale.debug('Valid: skey:', skey);
      const user = await this.authService.getUserInfoBySKey(skey);

      signale.debug('User:', user);
      if (user) {
        req.user = user;
      } else {
        throw new UnauthorizedException(ERRORS.ERR_SKEY_INVALID);
      }
      next();
    };
  }
}
