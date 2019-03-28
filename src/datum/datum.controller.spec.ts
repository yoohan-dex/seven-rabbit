import { Test, TestingModule } from '@nestjs/testing';
import { DatumController } from './datum.controller';

describe('Datum Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [DatumController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: DatumController = module.get<DatumController>(DatumController);
    expect(controller).toBeDefined();
  });
});
