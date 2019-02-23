import { Controller, Post, Body, Param } from '@nestjs/common';
import { ScantimeService } from './scantime.service';
import { User } from '../shared/decorators/user';
import { WxUser } from '../auth/auth.entity';

@Controller('scantime')
export class ScantimeController {
  constructor(private readonly scantimeService: ScantimeService) {}

  @Post('/:id')
  async recordOneItem(
    @Param('id') productId: number,
    @User() user: WxUser,
    @Body('seconds') seconds: number,
  ) {
    return await this.scantimeService.recordOne(productId, user.id, seconds);
  }
}
