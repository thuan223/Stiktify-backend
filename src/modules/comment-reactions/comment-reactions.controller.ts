import { Controller, UseGuards, Request, Post, Body } from '@nestjs/common';
import { CommentReactionsService } from './comment-reactions.service';
import {
  CreateCommentReactionDto,
  GetReaction,
  LikeMusicCommentDto,
} from './dto/create-comment-reaction.dto';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { DeleteCommentReactionDto } from './dto/delete-comment-reaction.dto';
import { Types } from 'mongoose';

@Controller('comment-reactions')
export class CommentReactionsController {
  constructor(
    private readonly commentReactionsService: CommentReactionsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('react')
  async reactToComment(@Request() req, @Body() dto: CreateCommentReactionDto) {
    const userId = req.user._id;
    return this.commentReactionsService.reactToComment(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('unreact')
  async unreactToComment(
    @Request() req,
    @Body() dto: DeleteCommentReactionDto,
  ) {
    const userId = req.user._id;
    return this.commentReactionsService.unreactToComment(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('getReactByUser')
  async getUserReaction(@Request() req, @Body() dto: GetReaction) {
    const userId = req.user._id;
    return this.commentReactionsService.getUserReaction(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('like-music-comment')
  async likeMusicComment(@Request() req, @Body() dto: LikeMusicCommentDto) {
    const userId = req.user._id;
    return this.commentReactionsService.likeMusicComment(userId, dto);
  }
}
