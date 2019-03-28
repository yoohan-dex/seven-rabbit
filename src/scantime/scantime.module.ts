import { Module } from '@nestjs/common';
import { ScantimeController } from './scantime.controller';
import { ScantimeService } from './scantime.service';
import { TypeOrmModule } from '../../node_modules/@nestjs/typeorm';
import { Scantime } from './scantime.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Scantime])],
  controllers: [ScantimeController],
  providers: [ScantimeService],
})
export class ScantimeModule {}
