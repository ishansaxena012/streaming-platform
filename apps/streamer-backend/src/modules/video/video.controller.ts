import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
  Query,
  HttpCode,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { Param, Patch } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { Observable } from 'rxjs';
import { Role } from '@prisma/client';

import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateWatchProgressDto } from './dto/update-watch-progress.dto';
import { RolesGuard } from '../../common/guards/roles.guards';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VideoQueryDto } from './dto/video-query.dto';
import { GenerateUploadUrlDto } from './dto/generate-upload-url.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { VideoProgressService } from './video-progress.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Videos')
@Controller('videos')
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
    private readonly videoProgressService: VideoProgressService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new video metadata record (Admin only)' })
  @ApiCreatedResponse({ description: 'Video successfully created.' })
  @ApiBadRequestResponse({ description: 'Invalid video payload.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({ description: 'Forbidden access - Admin only.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  createVideo(@Body() dto: CreateVideoDto, @Req() req: Request) {
    const user = req.user as any;
    return this.videoService.createVideo(dto, user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all videos uploaded by the logged-in admin with pagination',
  })
  @ApiOkResponse({ description: 'Admin videos retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({ description: 'Forbidden access - Admin only.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('mine')
  findMyVideos(@Req() req: Request, @Query() query: PaginationDto) {
    const user = req.user as any;
    return this.videoService.findMyVideos(user.id, query);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Get all pending videos awaiting approval with pagination (Super Admin only)',
  })
  @ApiOkResponse({ description: 'Pending videos retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({ description: 'Forbidden access - Super Admin only.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Get('pending')
  findPendingVideos(@Query() query: PaginationDto) {
    return this.videoService.findPendingVideos(query);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customized home feed videos' })
  @ApiOkResponse({ description: 'Home feed retrieved successfully.' })
  @UseGuards(OptionalJwtAuthGuard)
  @Get('home')
  getHomeFeed(@Req() req: Request) {
    const user = req.user as any;
    return this.videoService.getHomeFeed(user?.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a pending video (Super Admin only)' })
  @ApiOkResponse({ description: 'Video successfully approved.' })
  @ApiNotFoundResponse({ description: 'Video not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({ description: 'Forbidden access - Super Admin only.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Patch(':id/approve')
  approveVideo(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.videoService.approveVideo(id, user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a pending video (Super Admin only)' })
  @ApiOkResponse({ description: 'Video successfully rejected.' })
  @ApiNotFoundResponse({ description: 'Video not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({ description: 'Forbidden access - Super Admin only.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Patch(':id/reject')
  rejectVideo(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.videoService.rejectVideo(id, user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update video watch progress seconds' })
  @ApiOkResponse({ description: 'Watch progress updated successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid payload.' })
  @ApiNotFoundResponse({ description: 'Video not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id/progress')
  updateWatchProgress(
    @Param('id') id: string,
    @Body() dto: UpdateWatchProgressDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.videoService.updateWatchProgress(
      id,
      user.id,
      dto.progressSeconds,
      dto.completed,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get playback details/URLs for a video' })
  @ApiOkResponse({ description: 'Playback details retrieved successfully.' })
  @ApiForbiddenResponse({ description: 'Premium subscription required.' })
  @ApiNotFoundResponse({ description: 'Video not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UseGuards(JwtAuthGuard)
  @Get(':id/playback')
  getPlaybackVideo(@Param('id') id: string, @Req() req) {
    return this.videoService.getPlaybackVideo(id, req.user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register playback event / track view' })
  @ApiCreatedResponse({ description: 'Playback registered successfully.' })
  @ApiNotFoundResponse({ description: 'Video not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @Post(':id/play')
  @UseGuards(JwtAuthGuard)
  registerPlayback(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.videoService.registerPlayback(user.id, id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Alternative endpoint to update video progress' })
  @ApiCreatedResponse({ description: 'Progress updated successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid progress payload.' })
  @ApiNotFoundResponse({ description: 'Video not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @Post(':id/progress')
  @UseGuards(JwtAuthGuard)
  updateProgress(
    @Param('id') videoId: string,
    @Body() dto: UpdateProgressDto,
    @Req() req: any,
  ) {
    return this.videoService.updateWatchProgress(
      videoId,
      req.user.id,
      dto.watchedSeconds,
      dto.completed,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get logged-in user watch history' })
  @ApiOkResponse({ description: 'Watch history retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @UseGuards(JwtAuthGuard)
  @Get('me/history')
  getMyWatchHistory(@Req() req: Request) {
    const user = req.user as any;
    return this.videoService.getMyWatchHistory(user.id);
  }

  @ApiOperation({ summary: 'Get all published videos matching query/filters' })
  @ApiOkResponse({ description: 'Published videos retrieved successfully.' })
  @Get()
  findPublishedVideos(@Query() query: VideoQueryDto) {
    return this.videoService.findPublishedVideos(query);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Get all videos in administrative dashboard context with pagination (Admin only)',
  })
  @ApiOkResponse({ description: 'All videos retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({ description: 'Forbidden access - Admin only.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/all')
  getAdminVideos(@Req() req: Request, @Query() query: PaginationDto) {
    const user = req.user as any;
    return this.videoService.getAdminVideos(user.id, query);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get summary statistics for dashboard (Admin only)',
  })
  @ApiOkResponse({ description: 'Stats retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({ description: 'Forbidden access - Admin only.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/stats')
  getAdminStats(@Req() req: Request) {
    const user = req.user as any;
    return this.videoService.getAdminStats(user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Generate a presigned S3 upload URL for media (Admin only)',
  })
  @ApiCreatedResponse({ description: 'Presigned URL generated successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid upload parameters.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({ description: 'Forbidden access - Admin only.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('upload-url')
  generateUploadUrl(@Body() dto: GenerateUploadUrlDto, @Req() req: Request) {
    const user = req.user as any;
    return this.videoService.generateUploadUrl(
      user.id,
      dto.fileName,
      dto.fileType,
      dto.folder,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get detailed analytical graphs/metrics for admin (Admin only)',
  })
  @ApiOkResponse({ description: 'Analytics retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({ description: 'Forbidden access - Admin only.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/analytics')
  getAdminAnalytics(@Req() req: Request) {
    const user = req.user as any;
    return this.videoService.getAdminAnalytics(user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get continuation list of videos half-watched with pagination',
  })
  @ApiOkResponse({
    description: 'Continue watching list retrieved successfully.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @Get('users/me/continue-watching')
  @UseGuards(JwtAuthGuard)
  getContinueWatching(@Req() req: Request, @Query() query: PaginationDto) {
    const user = req.user as any;
    return this.videoService.getContinueWatching(user.id, query);
  }

  @ApiOperation({ summary: 'Get trending videos with pagination' })
  @ApiOkResponse({ description: 'Trending videos retrieved successfully.' })
  @Get('trending')
  getTrendingVideos(@Query() query: PaginationDto) {
    return this.videoService.getTrendingVideos(query);
  }

  @ApiOperation({ summary: 'Get all categories with video summaries' })
  @ApiOkResponse({ description: 'Categories retrieved successfully.' })
  @Get('categories')
  getCategories() {
    return this.videoService.getCategories();
  }

  @ApiOperation({
    summary: 'Search published videos by title/description with pagination',
  })
  @ApiQuery({ name: 'q', description: 'Search term', required: true })
  @ApiOkResponse({ description: 'Matched videos returned successfully.' })
  @Get('search')
  searchVideos(@Query('q') queryStr: string, @Query() query: PaginationDto) {
    return this.videoService.searchVideos(queryStr, query);
  }

  @ApiOperation({
    summary: 'Get published videos in a category with pagination',
  })
  @ApiParam({
    name: 'slug',
    description: 'The unique slug of the category',
    required: true,
  })
  @ApiOkResponse({ description: 'Category videos retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Category not found.' })
  @Get('category/:slug')
  getVideosByCategory(
    @Param('slug') slug: string,
    @Query() query: PaginationDto,
  ) {
    return this.videoService.getVideosByCategory(slug, query);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retry transcode/processing of failed HLS encoding',
  })
  @ApiOkResponse({ description: 'Retried encoding successfully queued.' })
  @ApiNotFoundResponse({ description: 'Video not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({
    description: 'Forbidden access - Admin/Super Admin only.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id/retry-processing')
  retryVideoProcessing(@Param('id') id: string) {
    return this.videoService.retryVideoProcessing(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a video to personal watchlist' })
  @ApiCreatedResponse({ description: 'Video added successfully.' })
  @ApiNotFoundResponse({ description: 'Video not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @Post(':id/watchlist')
  @UseGuards(JwtAuthGuard)
  addToWatchlist(@Param('id') videoId: string, @Req() req: any) {
    return this.videoService.addToWatchlist(req.user.id, videoId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a video from personal watchlist' })
  @ApiOkResponse({ description: 'Video removed successfully.' })
  @ApiNotFoundResponse({ description: 'Video not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @Delete(':id/watchlist')
  @UseGuards(JwtAuthGuard)
  removeFromWatchlist(@Param('id') videoId: string, @Req() req: any) {
    return this.videoService.removeFromWatchlist(req.user.id, videoId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Track a video view anonymously or authenticated' })
  @ApiOkResponse({ description: 'View tracked successfully.' })
  @Post(':id/view')
  @HttpCode(200)
  async trackView(@Param('id') videoId: string, @Req() req: any) {
    return this.videoService.trackVideoView(req.user?.sub, videoId);
  }

  @ApiOperation({
    summary: 'Get current HLS transcoding / processing progress and status',
  })
  @ApiOkResponse({ description: 'Processing status retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Video not found.' })
  @Get(':id/status')
  getVideoProcessingStatus(@Param('id') id: string) {
    return this.videoService.getVideoProcessingStatus(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get personal watchlist details with pagination' })
  @ApiOkResponse({ description: 'Watchlist retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @Get('users/me/watchlist')
  @UseGuards(JwtAuthGuard)
  getWatchlist(@Req() req: any, @Query() query: PaginationDto) {
    return this.videoService.getUserWatchlist(req.user.id, query);
  }

  @ApiOperation({
    summary: 'Server-sent events for video HLS transcoding progress stream',
  })
  @ApiOkResponse({
    description: 'SSE progress stream successfully initialized.',
  })
  @Sse(':id/progress/stream')
  streamVideoProgress(@Param('id') videoId: string): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      const unsubscribe = this.videoProgressService.subscribe(
        videoId,
        (data) => {
          subscriber.next({
            data,
          });
        },
      );

      return () => {
        unsubscribe();
      };
    });
  }
  @ApiOperation({ summary: 'Get single video by ID' })
  @ApiOkResponse({ description: 'Video retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Video not found.' })
  @Get(':id')
  findOneVideo(@Param('id') id: string) {
    return this.videoService.findOneVideo(id);
  }
}
