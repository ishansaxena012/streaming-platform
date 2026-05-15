import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Param, Patch } from '@nestjs/common';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateWatchProgressDto } from './dto/update-watch-progress.dto';
import { RolesGuard } from '../../common/guards/roles.guards';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { VideoQueryDto } from './dto/video-query.dto';
import { Query } from '@nestjs/common';
import { GenerateUploadUrlDto } from './dto/generate-upload-url.dto';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  createVideo(@Body() dto: CreateVideoDto, @Req() req: Request) {
    const user = req.user as any;
    return this.videoService.createVideo(dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('mine')
  findMyVideos(@Req() req: Request) {
    const user = req.user as any;
    return this.videoService.findMyVideos(user.id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Get('pending')
  findPendingVideos() {
    return this.videoService.findPendingVideos();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Patch(':id/approve')
  approveVideo(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;

    return this.videoService.approveVideo(id, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Patch(':id/reject')
  rejectVideo(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;

    return this.videoService.rejectVideo(id, user.id);
  }

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
      dto.progress,
      dto.completed,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/history')
  getMyWatchHistory(@Req() req: Request) {
    const user = req.user as any;

    return this.videoService.getMyWatchHistory(user.id);
  }

  @Get()
  findPublishedVideos(@Query() query: VideoQueryDto) {
    return this.videoService.findPublishedVideos(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/all')
  getAdminVideos(@Req() req: Request) {
    const user = req.user as any;
    return this.videoService.getAdminVideos(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/stats')
  getAdminStats(@Req() req: Request) {
    const user = req.user as any;
    return this.videoService.getAdminStats(user.id);
  }

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/analytics')
  getAdminAnalytics(@Req() req: Request) {
    const user = req.user as any;
    return this.videoService.getAdminAnalytics(user.id);
  }
}
