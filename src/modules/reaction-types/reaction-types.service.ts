import { Injectable } from '@nestjs/common';
import { CreateReactionTypeDto } from './dto/create-reaction-type.dto';
import { UpdateReactionTypeDto } from './dto/update-reaction-type.dto';

@Injectable()
export class ReactionTypesService {
  create(createReactionTypeDto: CreateReactionTypeDto) {
    return 'This action adds a new reactionType';
  }

  findAll() {
    return `This action returns all reactionTypes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} reactionType`;
  }

  update(id: number, updateReactionTypeDto: UpdateReactionTypeDto) {
    return `This action updates a #${id} reactionType`;
  }

  remove(id: number) {
    return `This action removes a #${id} reactionType`;
  }
}
