import { forwardRef, Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Report, ReportSchema } from './schemas/report.schema';
import { ShortVideosModule } from '../short-videos/short-videos.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => ShortVideosModule),
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }
    ])],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService, MongooseModule]
})
export class ReportModule { }
