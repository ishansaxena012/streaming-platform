import { Controller, Get, UseGuards } from '@nestjs/common';

import { QueueService } from './queue.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../../common/guards/roles.guards';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Get('video-processing/stats')
  getVideoQueueStats() {
    return this.queueService.getVideoQueueStats();
  }
}
