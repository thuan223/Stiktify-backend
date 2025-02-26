import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { UploadImageDto } from './dto/upload-file.dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn 10MB
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!dto.folder) {
      throw new BadRequestException('Folder name is required');
    }

    try {
      const result = await this.uploadService.uploadImage(file, dto.folder);
      return result
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      throw new BadRequestException({
        success: false,
        message: 'Image upload failed',
        error: error.message,
      });
    }
  }

  @Post('upload-video')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('video/')) {
          return callback(
            new BadRequestException('Only video files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.uploadService.uploadVideo(file);
  }

  @Post('upload-music')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('audio/')) {
          return callback(
            new BadRequestException('Only audio files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadMusic(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.uploadService.uploadMusic(file);
  }
}
