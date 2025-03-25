import { Public } from '@/decorator/customize';
import { TrendingVideoDto } from './dto/trending-video.dto';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ShortVideosService } from './short-videos.service';
import { CreateShortVideoDto } from './dto/create-short-video.dto';
import { UpdateShortVideoDto } from './dto/update-short-video.dto';
import { ResponseMessage } from '@/decorator/customize';
import { flagShortVideoDto } from './dto/flag-short-video.dto';
import { UpdateVideoByViewingDto } from './dto/update-view-by-viewing.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import multer from 'multer';

@Controller('short-videos')
export class ShortVideosController {
  constructor(private readonly shortVideosService: ShortVideosService) {}
  @Public()
  @Get('getColabVideo/:userCollabId')
  async init(@Param('userCollabId') userCollabId: string) {
    return this.shortVideosService.getCollaboratorFilteringVideo(userCollabId);
  }
  //Create a new short video - ThangLH
  @Post('create')
  @UseInterceptors(
    FileInterceptor('videoThumbnail', {
      storage: diskStorage({
        destination: './uploads/thumbnails', // Thư mục lưu ảnh thumbnail
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async createPost(
    @Body() createShortVideoDto: CreateShortVideoDto,
    @UploadedFile() videoThumbnail: Express.Multer.File,
  ) {
    if (videoThumbnail) {
      createShortVideoDto.videoThumbnail = `/uploads/thumbnails/${videoThumbnail.filename}`;
    }
    return this.shortVideosService.create(createShortVideoDto);
  }
  // Lấy ra video dự vào UserId - ThangLH
  @Get('user-videos/:userId')
  getVideosByUserId(@Param('userId') userId: string) {
    return this.shortVideosService.getVideosByUserId(userId);
  }
  @Public()
  @Get('getTopVideo/:title') 
  getTopVideo(@Param('title') title: string) {
    return this.shortVideosService.getTop50Videos(title);
  }
  @Get('list-video')
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.shortVideosService.findAll(query, +current, +pageSize);
  }
  @Get('get-top-one-videos')
  @Public()
  getTopOneVideos() {
    return this.shortVideosService.getTopVideos();
  }
  @Get(':videoId')
  async getVideoById(@Param('videoId') videoId: string) {
    return this.shortVideosService.findVideoById(videoId);
  }

  @Post('flag-video')
  @ResponseMessage('Updated successfully')
  findOne(@Body() req: flagShortVideoDto) {
    return this.shortVideosService.handleFlagVideo(req._id, req.flag);
  }
  @Post('trending-guest-videos')
  @Public()
  getTrendingVideosByGuest() {
    return this.shortVideosService.getTrendingVideosByGuest();
  }
  @Post('update-view-by-viewing')
  @Public()
  updateViewByViewing(
    @Body() updateVideoByViewingDto: UpdateVideoByViewingDto,
  ) {
    return this.shortVideosService.updateViewByViewing(updateVideoByViewingDto);
  }

  @Post('trending-user-videos')
  getTrendingVideosByUser(@Body() trendingVideoDto: TrendingVideoDto) {
    return this.shortVideosService.getTrendingVideosByUser(trendingVideoDto);
  }

  @Get('my-videos/:userId')
  getUserVideos(
    @Param('userId') userId: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.shortVideosService.ViewVideoPosted(userId, +current, +pageSize);
  }

  @Get('filter-by-category')
  async filterByCategory(
    @Query('category') category: string,
    @Query('current') current?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.shortVideosService.findByCategory(
      category,
      +current || 1,
      +pageSize || 10,
    );
  }

  @Get('filter-searchVideo')
  @Get('filter-searchCategory')
  findAllUserByFilterAndSearch(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.shortVideosService.handleFilterSearchVideo(
      query,
      +current,
      +pageSize,
    );
  }
  @Post('get-tag-by-ai')
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
  async getTagByAI(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.shortVideosService.getTagVideoByAi(file);
  }

  // Update video
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateShortVideoDto: UpdateShortVideoDto,
  ) {
    return this.shortVideosService.update(id, updateShortVideoDto);
  }
  // Delete video - ThangLH
  @Post(':videoId')
  async deleteVideo(
    @Param('videoId') videoId: string,
    @Body('userId') userId: string,
  ) {
    return this.shortVideosService.deleteVideo(videoId, userId);
  }

  // Share a Video - ThangLH
  @Get('share/:id')
  @Public()
  async shareVideo(@Param('id') id: string) {
    return this.shortVideosService.shareVideo(id);
  }
}
