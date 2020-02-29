import { Module } from '@nestjs/common';
import { QyService } from './qy.service';
import { QyController } from './qy.controller';
import { ApiConfig, QyApiConfigKit, ApiConfigKit } from 'tnwx';

const { QY_CORP_ID, QY_AGENT_ID, QY_SECRECT } = process.env;

export const configQY = () => {
  const qyApiConfig = new ApiConfig(
    QY_AGENT_ID,
    QY_SECRECT,
    'whatever',
    false,
    '',
    QY_CORP_ID,
  );
  ApiConfigKit.putApiConfig(qyApiConfig);
  ApiConfigKit.devMode = true;
  ApiConfigKit.setCurrentAppId(qyApiConfig.getAppId, qyApiConfig.getCorpId);
  QyApiConfigKit.putApiConfig(qyApiConfig);
  QyApiConfigKit.devMode = true;
  QyApiConfigKit.setCurrentAppId(qyApiConfig.getAppId, qyApiConfig.getCorpId);
};

@Module({
  providers: [QyService],
  controllers: [QyController],
})
export class QyModule {
  constructor() {
    configQY();
  }
}
