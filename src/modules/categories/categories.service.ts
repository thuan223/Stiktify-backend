import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<Category>,
  ) {}

  create(createCategoryDto: CreateCategoryDto) {
    return 'This action adds a new category';
  }

  async checkCategoryById(id: string) {
    try {
      const result = await this.categoryModel.findById(id);

      if (result) {
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async handleGetAllCategory() {
    const result = await this.categoryModel.find();
    return result;
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }

  async findCategoryByName(categoryName: string) {
    const category = await this.categoryModel
      .findOne({
        categoryName: { $regex: new RegExp(`^${categoryName}$`, 'i') },
      })
      .exec();
    return category;
  }

  async getCategoryById(categoryId: string) {
    return await this.categoryModel.findById(categoryId);
  }
}
