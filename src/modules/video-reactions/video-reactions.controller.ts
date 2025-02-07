import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { VideoReactionsService } from './video-reactions.service';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import {
  CreateVideoReactionDto,
  GetReaction,
} from './dto/create-video-reaction.dto';
import { DeleteVideoReactionDto } from './dto/delete-video-reaction.dto';
import { Types } from 'mongoose';

@Controller('video-reactions')
export class VideoReactionsController {
  constructor(private readonly videoReactionService: VideoReactionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('react')
  async reactToVideo(@Request() req, @Body() dto: CreateVideoReactionDto) {
    const userId = req.user._id;
    return this.videoReactionService.reactToVideo(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('unreact')
  async unreactToVideo(@Request() req, @Body() dto: DeleteVideoReactionDto) {
    const userId = req.user._id;
    return this.videoReactionService.unreactToVideo(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('getReactByUser')
  async getUserReaction(@Request() req, @Body() dto: GetReaction) {
    const userId = req.user._id;
    return this.videoReactionService.getUserReaction(userId, dto);
  }
}
