import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VideoReactionsService } from './video-reactions.service';
import { CreateVideoReactionDto } from './dto/create-video-reaction.dto';
import { UpdateVideoReactionDto } from './dto/update-video-reaction.dto';

@Controller('video-reactions')
export class VideoReactionsController {
  constructor(private readonly videoReactionsService: VideoReactionsService) {}

  @Post()
  create(@Body() createVideoReactionDto: CreateVideoReactionDto) {
    return this.videoReactionsService.create(createVideoReactionDto);
  }

  @Get()
  findAll() {
    return this.videoReactionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.videoReactionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVideoReactionDto: UpdateVideoReactionDto) {
    return this.videoReactionsService.update(+id, updateVideoReactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.videoReactionsService.remove(+id);
  }
}
