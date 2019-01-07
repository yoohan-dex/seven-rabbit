import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { WxUser } from './auth.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('AuthService', () => {
  let service: AuthService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(), TypeOrmModule.forFeature([WxUser])],
      providers: [AuthService],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('can create a new user', async () => {
    const user = await service.saveUserInfo(
      'whateverSkey',
      {
        avatarUrl: '',
        nickName: 'yoohoooooo',
        city: 'shantou',
        country: 'china',
        gender: 1,
        openId: 'whateverok?',
        province: 'guangdong',
        watermark: {
          timestamp: new Date().getTime(),
          appid: 'jaisdjfiejskmdfk',
        },
        language: 'zh',
      },
      'whateverSessionKey',
    );

    expect(user.openId).toBe('whateverok?');
    expect(user.skey).toBe('whateverSkey');
    expect(user.sessionkey).toBe('whateverSessionKey');
  });

  it('can get One user', async () => {
    const user = await service.getOneUser();
    expect(user).toBeDefined();
  });
});
