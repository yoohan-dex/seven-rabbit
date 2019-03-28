import { Module } from '@nestjs/common';
import { DatumService } from './datum.service';
import { DatumController } from './datum.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimpleData } from './datum.entity';
import { WxUser } from '../auth/auth.entity';
import { Product } from '../product/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SimpleData, WxUser, Product])],
  providers: [DatumService],
  controllers: [DatumController],
})
export class DatumModule {}
