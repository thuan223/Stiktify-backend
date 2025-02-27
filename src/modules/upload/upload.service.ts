import { BadRequestException, Injectable } from '@nestjs/common';
import { uploadFile } from '@/helpers/uploadFileHelper';

@Injectable()
export class UploadService {
  async uploadImage(file: Express.Multer.File, folder: string) {
    try {
      const result = await uploadFile(file, folder);
      return result
    } catch (error) {
      console.error('❌ Upload failed:', error);
      throw new BadRequestException({
        success: false,
        message: 'Upload failed',
        error: error.message,
      });
    }
  }

  async uploadFileToFolder(file: Express.Multer.File, folder: string) {
    try {
      const result = await uploadFile(file, folder);
      return result
    } catch (error) {
      console.error(`❌ Upload to ${folder} failed:`, error);
      throw new BadRequestException({
        success: false,
        message: `Upload to ${folder} failed`,
        error: error.message,
      });
    }
  }

  async uploadVideo(file: Express.Multer.File) {
    return this.uploadFileToFolder(file, 'videos');
  }

  async uploadMusic(file: Express.Multer.File) {
    return this.uploadFileToFolder(file, 'musics');
  }
}
