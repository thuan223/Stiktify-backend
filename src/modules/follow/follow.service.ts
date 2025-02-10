import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Follow } from './schemas/follow.schema';


@Injectable()
export class FollowService {
  constructor(
    @InjectModel(Follow.name) private followModel: Model<Follow>,
  ) {}
  create(createFollowDto: CreateFollowDto) {
    return 'This action adds a new follow';
  }

  async findAll():Promise<string[]> {
    const follow = await this.followModel.find().select('userFollowingId').exec();
    return follow.map(follow => follow.userFollowingId)
  }

  findOne(id: number) {
    return `This action returns a #${id} follow`;
  }

  update(id: number, updateFollowDto: UpdateFollowDto) {
    return `This action updates a #${id} follow`;
  }

  remove(id: number) {
    return `This action removes a #${id} follow`;
  }

  async checkFollow(followerId: string, followingId: string){
    const exsistFollowing = await this.followModel.findOne({
      userId: new Types.ObjectId(followerId),
      userFollowingId: new Types.ObjectId(followingId)
    }) 
    if(exsistFollowing){
      return true;
    }
    return false;
  }

  async followAnotherUser(followerId:string, followingId: string){
    const alreadyFollow = await this.checkFollow(followerId, followingId)
    if(alreadyFollow){
   const unfollow =  await this.followModel.deleteOne({
        userId: followerId,
        userFollowingId: followingId
      })
    return unfollow;
    }
    const follow = await this.followModel.create({
        userId: followerId,
        userFollowingId: followingId,
    })
    return follow;
  }

}

