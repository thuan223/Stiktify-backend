import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FriendRequest } from './schema/friend-request.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { Notification } from '../notifications/schema/notification.schema';

@Injectable()
export class FriendRequestService {
  constructor(
    @InjectModel(FriendRequest.name)
    private friendRequestModel: Model<FriendRequest>,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async sendFriendRequest(dto: CreateFriendRequestDto) {
    const request = await this.friendRequestModel.create({
      senderId: dto.senderId,
      receiverId: dto.receiverId,
    });

    // Gửi thông báo
    const notification = await this.notificationsService.createNotification({
      recipient: dto.receiverId,
      sender: dto.senderId,
      type: 'friend-request',
      friendRequestId: request._id,
    });

    // Populate fullname của sender
    const populatedNotification = await this.notificationModel
      .findById(notification._id)
      .populate('sender', 'fullname image')
      .select('recipient sender type status createdAt friendRequestId')
      .lean();

    if (!populatedNotification) {
      console.error('❌ Không tìm thấy thông báo');
      return request;
    }

    // Gửi thông báo với fullname
    this.notificationsGateway.sendNotification(
      dto.senderId,
      dto.receiverId,
      populatedNotification,
    );

    return request;
  }

  async acceptFriendRequest(id: string) {
    const objectId = new Types.ObjectId(id);
    await this.notificationModel.findOneAndUpdate(
      { friendRequestId: objectId },
      {
        status: 'accepted',
      },
      { new: true },
    );

    const request = await this.friendRequestModel.findByIdAndUpdate(
      id,
      { status: 'accepted' },
      { new: true },
    );

    // Gửi thông báo
    const notification = await this.notificationsService.createNotification({
      recipient: request.senderId,
      sender: request.receiverId,
      type: 'accept-friend-request',
      friendRequestId: request._id,
      status: 'accepted',
    });

    // Populate fullname của sender
    const populatedNotification = await this.notificationModel
      .findById(notification._id)
      .populate('sender', 'fullname image')
      .select('recipient sender type status createdAt friendRequestId')
      .lean();

    this.notificationsGateway.sendNotification(
      request.receiverId,
      request.senderId,
      populatedNotification,
    );

    console.log('Request >>>', request);

    return request;
  }

  async rejectFriendRequest(id: string) {
    const objectId = new Types.ObjectId(id);
    await this.notificationModel.findOneAndUpdate(
      { friendRequestId: objectId },
      {
        status: 'rejected',
      },
      { new: true },
    );

    return await this.friendRequestModel.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      { new: true },
    );
  }

  async getFriendRequestsForUser(userId: string) {
    return await this.friendRequestModel.find({
      receiverId: userId,
      status: 'pending',
    });
  }

  async checkFriendshipStatus(
    userId1: string,
    userId2: string,
  ): Promise<boolean> {
    const friendship = await this.friendRequestModel.findOne({
      $or: [
        { senderId: userId1, receiverId: userId2, status: 'accepted' },
        { senderId: userId2, receiverId: userId1, status: 'accepted' },
      ],
    });

    return !!friendship;
  }

  async unFriend(userId1: string, userId2: string): Promise<boolean> {
    const friendship = await this.friendRequestModel.findOneAndDelete({
      $or: [
        { senderId: userId1, receiverId: userId2, status: 'accepted' },
        { senderId: userId2, receiverId: userId1, status: 'accepted' },
      ],
    });

    return !!friendship;
  }

  async getFriendsList(userId: string) {
    const friends = await this.friendRequestModel
      .find({
        $or: [{ senderId: userId }, { receiverId: userId }],
        status: 'accepted',
      })
      .lean();

    const uniqueFriends = Array.from(
      new Set(
        friends.map((friend) =>
          friend.senderId === userId ? friend.receiverId : friend.senderId,
        ),
      ),
    ).map((friendId) => ({ friendId }));

    return uniqueFriends;
  }
}
