import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WxUser } from './auth.entity';
import { AuthService } from './auth.service';

describe('Auth Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(), TypeOrmModule.forFeature([WxUser])],
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();
  });
  it('should be defined', () => {
    const controller: AuthController = module.get<AuthController>(
      AuthController,
    );
    expect(controller).toBeDefined();
  });
});
