import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @ApiOperation({ summary: 'Upgrade user subscription to Premium plan' })
  @ApiCreatedResponse({ description: 'Subscription upgraded successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid user or subscription error.' })
  @UseGuards(JwtAuthGuard)
  @Post('upgrade')
  upgradeToPremium(@Req() req: any) {
    return this.subscriptionsService.upgradeToPremium(req.user.id);
  }

  @ApiOperation({ summary: "Get current user's subscription status" })
  @ApiOkResponse({ description: 'Subscription details retrieved successfully.' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMySubscription(@Req() req: any) {
    return this.subscriptionsService.getMySubscription(req.user.id);
  }
}
