import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Types } from 'mongoose';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('video/:videoId')
  async getCommentsByVideoId(@Param('videoId') videoId: Types.ObjectId) {
    return await this.commentsService.getCommentsByVideoId(videoId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createComment(
    @Req() req: any,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const userId = req.user._id;

    return this.commentsService.createComment(userId, createCommentDto);
  }
}
