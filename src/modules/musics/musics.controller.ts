import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request } from '@nestjs/common';
import { MusicsService } from './musics.service';
import { CreateMusicDto } from './dto/create-music.dto';
import { Public, ResponseMessage } from '@/decorator/customize';
import { flagMusicDto } from './dto/flag.dto';
import { CreateNeo4j } from './dto/create-neo4j.dto';
import { UpdateMusicDto } from './dto/update-music.dto';

@Controller('musics')
export class MusicsController {
  constructor(private readonly musicsService: MusicsService) { }

  @Post("upload-music")
  uploadMusic(@Body() createMusicDto: CreateMusicDto) {
    return this.musicsService.handleUploadMusic(createMusicDto);
  }

  @Post("upload-music")
  updateMusic(@Body() updateMusicDto: UpdateMusicDto) {
    return this.musicsService.handleUpdateMusic(updateMusicDto);
  }

  @Get('my-musics')
  getUserMusics(
    @Request() req,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.musicsService.handleMyMusic(
      req.user._id,
      +current,
      +pageSize,
    );
  }

  @Public()
  @Get("filter-search")
  popularArtists() {
    return this.musicsService.handlePopularArtists()
  }

  @Public()
  @Get("filter-search")
  findMusicFilterAndSearch(
    @Query() query: any,
    @Query("current") current: string,
    @Query("pageSize") pageSize: string,
  ) {
    return this.musicsService.handleFilterAndSearchMusic(query, +current, +pageSize)
  }

  @Public()
  @Get("list-hot-music")
  listHotMusic() {
    return this.musicsService.getMusicHotInWeek();
  }

  @Public()
  @Get('/display-music/:id')
  displayMusic(
    @Param("id") id: string
  ) {
    return this.musicsService.handleDisplayMusic(id);
  }

  @Public()
  @Get('/list-music')
  listMusic(
    @Query("current") current: string,
    @Query("pageSize") pageSize: string,
  ) {
    return this.musicsService.handleListMusic(+current, +pageSize);
  }

  @Public()
  @Get('update-listener/:id')
  updateListener(@Param('id') id: string) {
    return this.musicsService.handleUpdateListener(id);
  }

  @Post('flag-music')
  @ResponseMessage('Updated successfully')
  findOne(@Body() req: flagMusicDto) {
    return this.musicsService.handleFlagVideo(req._id, req.flag);
  }
  // Delete
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.musicsService.remove(+id);
  }

  // Share a music - ThangLH
  @Get('share/:id')
  @Public()
  async shareMusic(@Param('id') id: string) {
    return this.musicsService.shareMusic(id);
  }

  // Getall music id - ThanglH
  @Get()
  getAllMusic() {
    return this.musicsService.getAllMusic();
  }

  @Get('list-music-admin')
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.musicsService.handleListAllMusicAdmin(query, +current, +pageSize);
  }

  @Get('recommend-music/:userId')
  recommend(@Param('userId') userId: string) {
    return this.musicsService.handleRecommendMusic(userId);
  }

  @Post('listen-music-in-user')
  listenMusicInUser(@Body() req: CreateNeo4j) {
    return this.musicsService.handleListenMusicNeo4j(req.userId, req.musicId);
  }
}