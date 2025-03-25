import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FriendRequestService } from './friend-request.service';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';

@Controller('friend-requests')
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  @Post()
  async sendFriendRequest(@Body() dto: CreateFriendRequestDto) {
    return this.friendRequestService.sendFriendRequest(dto);
  }

  @Patch(':id/accept')
  async acceptFriendRequest(@Param('id') id: string) {
    return this.friendRequestService.acceptFriendRequest(id);
  }

  @Patch(':id/reject')
  async rejectFriendRequest(@Param('id') id: string) {
    return this.friendRequestService.rejectFriendRequest(id);
  }

  @Get(':userId')
  async getFriendRequests(@Param('userId') userId: string) {
    return this.friendRequestService.getFriendRequestsForUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('check-friendship/:userId')
  async checkFriendship(@Param('userId') userId: string, @Req() req: any) {
    const userId2 = req.user._id;

    const isFriend = await this.friendRequestService.checkFriendshipStatus(
      userId,
      userId2,
    );
    return { isFriend };
  }

  @UseGuards(JwtAuthGuard)
  @Get('unfriend/:userId')
  async unFriend(@Param('userId') userId: string, @Req() req: any) {
    const userId2 = req.user._id;

    const isFriend = await this.friendRequestService.unFriend(userId, userId2);
    return { isFriend };
  }

  @UseGuards(JwtAuthGuard)
  @Get('friends/:userId')
  async getFriends(@Param('userId') userId: string) {
    const friends = await this.friendRequestService.getFriendsList(userId);
    return { friends };
  }
}
