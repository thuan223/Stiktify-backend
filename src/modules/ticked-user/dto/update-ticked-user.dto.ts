import { PartialType } from '@nestjs/mapped-types';
import { CreateTickedUserDto } from './create-ticked-user.dto';

export class UpdateTickedUserDto extends PartialType(CreateTickedUserDto) {}
