import { PartialType } from '@nestjs/mapped-types';
import { CreateListeninghistoryDto } from './create-listeninghistory.dto';

export class UpdateListeninghistoryDto extends PartialType(CreateListeninghistoryDto) {}
