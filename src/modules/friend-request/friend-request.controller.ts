import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { FriendRequestService } from './friend-request.service';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';

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
}
