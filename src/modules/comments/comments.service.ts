import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCommentDto, UpdateCommentDescriptionDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './schema/comment.schema';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';

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

  async findAll(query: string, current: number, pageSize: number, parentId: string) {
    if (!current) current == 1;
    if (!pageSize) pageSize == 10;
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    filter.parentId = mongoose.isValidObjectId(parentId) ? parentId : null;
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

  async findOne(id: string) {
    if (mongoose.isValidObjectId(id)) {
      return await this.commentModel.findOne({ _id: id });
    }
    else {
      throw new BadRequestException("Invalid format object id!");
    }
  }

  async update(updateCommentDto: UpdateCommentDescriptionDto) {
    return await this.commentModel.updateOne(
      { _id: updateCommentDto._id },
      { CommentDescription: updateCommentDto.CommentDescription }
    );
  }

  async remove(id: string) {
    // Check id
    if (mongoose.isValidObjectId(id)) {
      // Delete
      return await this.commentModel.deleteOne({
        _id: id
      });
    } else {
      throw new BadRequestException("Invalid format object id");
    }
  }
}
