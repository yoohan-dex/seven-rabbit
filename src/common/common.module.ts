import { Module } from '@nestjs/common';
import { CommonController } from './common.controller';
import { CommonService } from './common.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './common.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Image])],
  controllers: [CommonController],
  providers: [CommonService],
})
export class CommonModule {}
