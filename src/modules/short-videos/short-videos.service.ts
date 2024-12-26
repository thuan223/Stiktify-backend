import { Injectable } from '@nestjs/common';
import { CreateShortVideoDto } from './dto/create-short-video.dto';
import { UpdateShortVideoDto } from './dto/update-short-video.dto';

@Injectable()
export class ShortVideosService {
  create(createShortVideoDto: CreateShortVideoDto) {
    return 'This action adds a new shortVideo';
  }

  findAll() {
    return `This action returns all shortVideos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} shortVideo`;
  }

  update(id: number, updateShortVideoDto: UpdateShortVideoDto) {
    return `This action updates a #${id} shortVideo`;
  }

  remove(id: number) {
    return `This action removes a #${id} shortVideo`;
  }
}
