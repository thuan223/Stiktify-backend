import { Injectable } from '@nestjs/common';
import { CreateVideoReactionDto } from './dto/create-video-reaction.dto';
import { UpdateVideoReactionDto } from './dto/update-video-reaction.dto';

@Injectable()
export class VideoReactionsService {
  create(createVideoReactionDto: CreateVideoReactionDto) {
    return 'This action adds a new videoReaction';
  }

  findAll() {
    return `This action returns all videoReactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} videoReaction`;
  }

  update(id: number, updateVideoReactionDto: UpdateVideoReactionDto) {
    return `This action updates a #${id} videoReaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} videoReaction`;
  }
}
