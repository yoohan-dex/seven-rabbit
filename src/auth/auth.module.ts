import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { WxUser, BackUser } from './auth.entity';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from './auth.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([WxUser, BackUser])],
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
      'auth/weapp/bindPhoneCode',
      'auth/weapp/add-role',
      'auth/weapp/remove-role',
      'auth/weapp/members',
      // order/
      'order/all-by-phone',
      'order/one-by-id',
      'order/search',
      // datum/
      'datum/simple',
      'datum/hot/products',
      'datum/hot/product',
      'datum/user',
      // topic/
      'topic/*',
      // lottery/
      // 'lottery/',
      'lottery/check-chance',
      'lottery/test-code',
      'lottery/bind-code',
      'lottery/code',
      'lottery/start',
      'lottery/my-prize',
      'lottery/prize-code',
      'lottery/check-prize',
    );
    consumer.apply();
  }
}
