import { PartialType } from '@nestjs/mapped-types';
import { CreateReportMusicDto } from './create-report.dto';
import { CreateReportVideoDto } from './create-report.dto';

export class UpdateReportDto extends PartialType(CreateReportMusicDto) {}
