import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { WatchlistService } from './watchlist.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':videoId')
  addToWatchlist(@Req() req: Request, @Param('videoId') videoId: string) {
    const user = req.user as any;

    return this.watchlistService.addToWatchlist(user.id, videoId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getMyWatchlist(@Req() req: Request) {
    const user = req.user as any;

    return this.watchlistService.getMyWatchlist(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':videoId')
  removeFromWatchlist(@Req() req: Request, @Param('videoId') videoId: string) {
    const user = req.user as any;

    return this.watchlistService.removeFromWatchlist(user.id, videoId);
  }
}
