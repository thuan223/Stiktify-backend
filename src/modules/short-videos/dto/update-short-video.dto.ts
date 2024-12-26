import { PartialType } from '@nestjs/mapped-types';
import { CreateShortVideoDto } from './create-short-video.dto';

export class UpdateShortVideoDto extends PartialType(CreateShortVideoDto) {}
