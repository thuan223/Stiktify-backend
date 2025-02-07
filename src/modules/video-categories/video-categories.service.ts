import { Injectable } from '@nestjs/common';
import { CreateVideoCategoryDto } from './dto/create-video-category.dto';
import { UpdateVideoCategoryDto } from './dto/update-video-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { VideoCategory } from './schemas/video-category.schema';
import { Model } from 'mongoose';

@Injectable()
export class VideoCategoriesService {
  constructor(
    @InjectModel(VideoCategory.name)
    private videoCategoryModel: Model<VideoCategory>,
  ) {}
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
    async getAllCategoryByVideo(videoId: String) {
      return await this.videoCategoryModel.find({ videoId: videoId });
    }
    async getRandomCategoryVideo(categoryId: any, videoId: String) {
      const randomCategoryVideo = await this.videoCategoryModel.aggregate([
        { $match: { categoryId: categoryId } },
        { $sample: { size: 1 } },
        // { $match: { categoryId: categoryId, videoId: { $ne: videoId } } }, 
        { $sample: { size: 1 } }, 
      ]);
      return randomCategoryVideo;
    }
    async findVideoCategoriesById(videoId:string){
      return await this.videoCategoryModel.find({videoId});
    }
    
    async findCategoryByName(categoryName: string) {
      return await this.videoCategoryModel.findOne({ categoryName }).exec();
    }
    
    async findVideosByCategoryId(categoryId: string) {
      return await this.videoCategoryModel.find({ categoryId }).exec();
    }
    
}
