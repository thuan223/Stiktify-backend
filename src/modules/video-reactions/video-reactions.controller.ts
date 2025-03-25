import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import { VideoReactionsService } from './video-reactions.service';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import {
  CreateVideoReactionDto,
  GetReaction,
} from './dto/create-video-reaction.dto';
import { DeleteVideoReactionDto } from './dto/delete-video-reaction.dto';
import { Types } from 'mongoose';
import { Public } from '@/decorator/customize';

@Controller('video-reactions')
export class VideoReactionsController {
  constructor(private readonly videoReactionsService: VideoReactionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('react')
  async reactToVideo(@Request() req, @Body() dto: CreateVideoReactionDto) {
    const userId = req.user._id;
    return this.videoReactionsService.reactToVideo(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('unreact')
  async unreactToVideo(@Request() req, @Body() dto: DeleteVideoReactionDto) {
    const userId = req.user._id;
    return this.videoReactionsService.unreactToVideo(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('getReactByUser')
  async getUserReaction(@Request() req, @Body() dto: GetReaction) {
    const userId = req.user._id;
    return this.videoReactionsService.getUserReaction(userId, dto);
  }

  @Public()
  @Get(':videoId/reactions')
  async getReactions(@Param('videoId') videoId: string) {
    return this.videoReactionsService.getVideoReactions(videoId);
  }

  //ThangLH
  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getReactionsByUserId(@Param('userId') userId: string) {
    return this.videoReactionsService.getReactionsByUserId(userId);
  }
}
