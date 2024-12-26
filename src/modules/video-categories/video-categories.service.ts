import { Injectable } from '@nestjs/common';
import { CreateVideoCategoryDto } from './dto/create-video-category.dto';
import { UpdateVideoCategoryDto } from './dto/update-video-category.dto';

@Injectable()
export class VideoCategoriesService {
  create(createVideoCategoryDto: CreateVideoCategoryDto) {
    return 'This action adds a new videoCategory';
  }

  findAll() {
    return `This action returns all videoCategories`;
  }

  findOne(id: number) {
    return `This action returns a #${id} videoCategory`;
  }

  update(id: number, updateVideoCategoryDto: UpdateVideoCategoryDto) {
    return `This action updates a #${id} videoCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} videoCategory`;
  }
}
