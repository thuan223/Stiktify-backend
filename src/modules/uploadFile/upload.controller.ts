import { Controller, Post, UseGuards, Req, Body } from '@nestjs/common';
import { UploadService } from './upload.service';
import { Video } from '@/modules/uploadFile/schemas/upload-video.schema';
import { CreateVideoDto } from '@/modules/uploadFile/dto/upload-file.dto';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-post')
  async createPost(@Req() req: any, @Body() createVideoDto: CreateVideoDto): Promise<Video> {
    const userId = req.user._id;
    return this.uploadService.createPost(userId, createVideoDto);
  }
}