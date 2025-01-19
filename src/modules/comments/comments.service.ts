import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './schema/comment.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { query } from 'express';

@Injectable()
export class CommentsService {
  /**
   * Create new Comment model when use the class CommentService
   */
  constructor(
    @InjectModel(Comment.name)
    private commentModel: Model<Comment>) { }

  async create(createCommentDto: CreateCommentDto) {
    try {
      const { userId, videoId, parentId, CommentDescription } = createCommentDto;
      const cmt = await this.commentModel.create({
        userId, videoId, parentId, CommentDescription
      })
      return {
        _id: cmt._id
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll(query: string, current: number, pageSize: number) {
    if (!current) current == 1;
    if (!pageSize) pageSize == 10;
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    filter.parentId = { "$ne": null };
    const totalItems = (await this.commentModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * (pageSize);
    const list = await this.commentModel
      .find(filter)
      .limit(filter.pageSize)
      .skip(skip)
      .sort(sort as any);
    return { list, totalPages };
  }

  async findAllOfParent(query: string, current: number, pageSize: number, id: string) {

  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
