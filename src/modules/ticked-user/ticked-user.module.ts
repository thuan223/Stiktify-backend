import { Module } from '@nestjs/common';
import { TickedUserService } from './ticked-user.service';
import { TickedUserController } from './ticked-user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TickedUser, TickedUserSchema } from './schemas/ticked-user.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TickedUser.name, schema: TickedUserSchema },
    ]),
    UsersModule,
  ],
  controllers: [TickedUserController],
  providers: [TickedUserService],
})
export class TickedUserModule {}
