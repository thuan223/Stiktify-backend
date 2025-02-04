import { PartialType } from '@nestjs/mapped-types';
import { CreateVideoReactionDto } from './create-video-reaction.dto';

export class UpdateVideoReactionDto extends PartialType(CreateVideoReactionDto) {}
