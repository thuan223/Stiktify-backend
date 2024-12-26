import { PartialType } from '@nestjs/mapped-types';
import { CreateVideoCategoryDto } from './create-video-category.dto';

export class UpdateVideoCategoryDto extends PartialType(CreateVideoCategoryDto) {}
