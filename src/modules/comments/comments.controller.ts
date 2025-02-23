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
  Patch,
  Delete,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import {
  CreateCommentDto,
  CreateMusicCommentDto,
  ReplyCommentDto,
} from './dto/create-comment.dto';
import { Types } from 'mongoose';
import { DeleteCommentDto, UpdateCommentDto } from './dto/update-comment.dto';

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
    @Body() dto: ReplyCommentDto,
  ) {
    const userId = req.user._id;
    return this.commentsService.replyToComment(userId, dto);
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

  @UseGuards(JwtAuthGuard)
  @Patch('update')
  async updateComment(@Req() req, @Body() updateCommentDto: UpdateCommentDto) {
    const userId = req.user._id;
    return this.commentsService.updateComment(userId, updateCommentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:commentId')
  async deleteComment(@Req() req, @Param('commentId') dto: DeleteCommentDto) {
    const userId = req.user._id;
    return this.commentsService.deleteComment(userId, dto);
  }
}
