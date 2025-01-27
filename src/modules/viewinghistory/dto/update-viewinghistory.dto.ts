import { PartialType } from '@nestjs/mapped-types';
import { CreateViewinghistoryDto } from './create-viewinghistory.dto';

export class UpdateViewinghistoryDto extends PartialType(CreateViewinghistoryDto) {}
