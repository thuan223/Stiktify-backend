import { PartialType } from '@nestjs/mapped-types';
import { CreateReactionTypeDto } from './create-reaction-type.dto';

export class UpdateReactionTypeDto extends PartialType(CreateReactionTypeDto) {}
