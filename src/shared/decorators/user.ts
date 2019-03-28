import { createParamDecorator, ForbiddenException } from '@nestjs/common';

export const User = createParamDecorator((data, req) => {
  if (!req.user) throw new ForbiddenException('需要先登录');

  return req.user;
});
