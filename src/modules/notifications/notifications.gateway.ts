import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';

@WebSocketGateway(8081, {
  cors: {
    origin: '*',
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})
export class NotificationsGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly notificationsService: NotificationsService) {}

  // @SubscribeMessage('sendNotification')
  // async handleSendNotification(
  //   @MessageBody()
  //   data: {
  //     recipient: string;
  //     sender: string;
  //     type: string;
  //     postId?: string;
  //   },
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   const notification =
  //     await this.notificationsService.createNotification(data);

  //   // Gửi thông báo đến client có recipientId
  //   console.log(`📢 Gửi thông báo tới ${data.recipient}:`, notification);

  //   this.server.to(data.recipient).emit('receiveNotification', notification);
  // }

  @SubscribeMessage('registerUser')
  handleRegisterUser(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(userId);
    // console.log(`User ${userId} joined room`);
  }

  async sendNotification(
    senderId: string,
    recipientId: string,
    notification: any,
  ) {
    // console.log(`📢 Gửi thông báo đến user ${recipientId}`);
    if (senderId !== recipientId)
      this.server.to(recipientId).emit('receiveNotification', notification);
  }

  // @SubscribeMessage('markAsRead')
  // async handleMarkAsRead(@MessageBody() id: string) {
  //   const updatedNotification =
  //     await this.notificationsService.markNotificationAsRead(id);
  //   this.server.emit('notificationRead', updatedNotification);
  // }

  handleConnection(client: Socket) {
    // console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // console.log(`Client disconnected: ${client.id}`);
  }
}
