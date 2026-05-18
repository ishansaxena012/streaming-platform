import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import type { Request } from 'express';

import { WatchlistService } from './watchlist.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Watchlist')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @ApiOperation({ summary: "Add a video to the user's watchlist" })
  @ApiCreatedResponse({ description: 'Video added to watchlist successfully.' })
  @ApiNotFoundResponse({ description: 'Video not found.' })
  @UseGuards(JwtAuthGuard)
  @Post(':videoId')
  addToWatchlist(@Req() req: Request, @Param('videoId') videoId: string) {
    const user = req.user as any;

    return this.watchlistService.addToWatchlist(user.id, videoId);
  }

  @ApiOperation({ summary: "Get current user's watchlist with pagination" })
  @ApiOkResponse({ description: 'Watchlist retrieved successfully.' })
  @UseGuards(JwtAuthGuard)
  @Get()
  getMyWatchlist(@Req() req: Request, @Query() query: PaginationDto) {
    const user = req.user as any;

    return this.watchlistService.getMyWatchlist(user.id, query);
  }

  @ApiOperation({ summary: "Remove a video from the user's watchlist" })
  @ApiOkResponse({ description: 'Video removed from watchlist successfully.' })
  @ApiNotFoundResponse({ description: 'Video or watchlist entry not found.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':videoId')
  removeFromWatchlist(@Req() req: Request, @Param('videoId') videoId: string) {
    const user = req.user as any;

    return this.watchlistService.removeFromWatchlist(user.id, videoId);
  }
}
