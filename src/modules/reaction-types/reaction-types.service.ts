import { Injectable } from '@nestjs/common';
import { CreateReactionTypeDto, UpdateReactionTypeDTO } from './dto/create-reaction-type.dto';
import { UpdateReactionTypeDto } from './dto/update-reaction-type.dto';
import aqp from 'api-query-params';
import { InjectModel } from '@nestjs/mongoose';
import { ReactionType } from './schemas/reaction-type.schema';
import { Model } from 'mongoose';

@Injectable()
export class ReactionTypesService {
  /**
   *
   */
  constructor(
    @InjectModel(ReactionType.name)
    private reactionTypeModel: Model<ReactionType>
  ) { }

  create(createReactionTypeDto: CreateReactionTypeDto) {
    return 'This action adds a new reactionType';
  }

  async findAll(query: string) {
    const { filter, sort } = aqp(query);
    const list = await this.reactionTypeModel
      .find(filter)
      .limit(filter.pageSize)
      .sort(sort as any);
    return { list };
  }

  findOne(id: number) {
    return `This action returns a #${id} reactionType`;
  }

  async update(updateReactionTypeDto: UpdateReactionTypeDTO) {
    return await this.reactionTypeModel.updateOne(
      { _id: updateReactionTypeDto._id },
      { reactionIcon: updateReactionTypeDto.reactionIcon }
    );
  }

  remove(id: number) {
    return `This action removes a #${id} reactionType`;
  }
}
