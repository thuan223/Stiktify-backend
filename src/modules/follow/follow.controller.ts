import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FollowService } from './follow.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';
import { Public } from '@/decorator/customize';

@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) { }
  @Post('create-follow')
  followUserByBody(@Body() body: { followerId: string; followingId: string }) {
    return this.followService.followAnotherUser(body.followerId, body.followingId);
  }

  @Get('list-following/:userId')
  findAll(
    @Param("userId") userId: string
  ) {
    return this.followService.findAll(userId);
  }

  @Get('list-video-following/:userId')
  getListVideoFollow(
    @Param("userId") userId: string,
    @Query("current") current: string,
    @Query("pageSize") pageSize: string,
  ) {
    return this.followService.handleGetListVideoFollow(userId, +current, +pageSize);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFollowDto: UpdateFollowDto) {
    return this.followService.update(+id, updateFollowDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.followService.remove(+id);
  }

} 
