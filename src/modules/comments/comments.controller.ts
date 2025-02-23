import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import {
  CreateCommentDto,
  CreateMusicCommentDto,
} from './dto/create-comment.dto';
import { Types } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';

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

  @Get('child-comments/:parentId')
  async getChildComments(@Param('parentId') parentId: string) {
    return this.commentsService.getChildComments(new Types.ObjectId(parentId));
  }

  @UseGuards(JwtAuthGuard)
  @Post('reply/:parentId')
  async replyToComment(
    @Req() req: any,
    @Param('parentId') parentId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const userId = req.user._id;
    return this.commentsService.replyToComment(
      userId,
      new Types.ObjectId(parentId),
      createCommentDto,
    );
  }

  @Get('music/:musicId')
  async getCommentsByMusicId(@Param('musicId') musicId: Types.ObjectId) {
    return await this.commentsService.getCommentsByMusicId(musicId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-music-comment')
  async createMusicComment(
    @Req() req: any,
    @Body() createMusicCommentDto: CreateMusicCommentDto,
  ) {
    const userId = req.user._id;

    return this.commentsService.createMusicComment(
      userId,
      createMusicCommentDto,
    );
  }
}
