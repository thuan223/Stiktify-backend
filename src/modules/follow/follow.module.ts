import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Follow, FollowSchema } from './schemas/follow.schema';
import { ShortVideosModule } from '../short-videos/short-videos.module';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    ShortVideosModule,
    MongooseModule.forFeature([{ name: Follow.name, schema: FollowSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [FollowController],
  providers: [FollowService],
  exports: [MongooseModule],
})
export class FollowModule {}
