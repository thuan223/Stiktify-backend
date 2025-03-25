import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Video, VideoSchema } from '../short-videos/schemas/short-video.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema },
    { name: Video.name, schema: VideoSchema },
  ])],
  controllers: [UsersController],
  providers: [UsersService],
  exports:[UsersService, MongooseModule]
})
export class UsersModule {}
