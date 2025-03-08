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
    this.notificationsGateway.sendFriendRequestNotification(
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

    return await this.friendRequestModel.findByIdAndUpdate(
      id,
      { status: 'accepted' },
      { new: true },
    );
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
}
