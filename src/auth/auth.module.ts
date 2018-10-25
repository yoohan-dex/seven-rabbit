import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { WxUser } from './auth.entity';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from './auth.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([WxUser])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      'auth/weapp/user',
      'auth/weapp/bindphone',
      'auth/weapp/userInfo',
      'auth/weapp/decryptPhone',
      // 'order/',
      'order/all-by-phone',
      'order/one-by-id',
      'order/search',
    );
  }
}
