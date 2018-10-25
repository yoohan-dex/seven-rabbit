import { createParamDecorator } from '@nestjs/common';

export const User = createParamDecorator((data, req) => {
  console.log('user', req.user);
  return req.user;
});
