import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDescriptionDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }

  @Get()
  async findAll(
    @Query() query: string,
    @Query("current") current: string,
    @Query("pageSize") pageSize: string
  ) {
    return this.commentsService.findAll(query, +current, +pageSize, null);
  }

  @Get(':parentId')
  async findAllOfParent(
    @Param('parentId') parentId: string,
    @Query() query: string,
    @Query("current") current: string,
    @Query("pageSize") pageSize: string
  ) {
    return this.commentsService.findAll(query, +current, +pageSize, parentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Patch()
  async update(@Body() updateCommentDto: UpdateCommentDescriptionDto) {
    return await this.commentsService.update(updateCommentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.commentsService.remove(id);
  }
}
