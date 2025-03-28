import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Follow } from './schemas/follow.schema';
import { ShortVideosService } from '../short-videos/short-videos.service';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel(Follow.name) private followModel: Model<Follow>,
    @InjectModel(User.name) private userModel: Model<User>,
    private videoService: ShortVideosService,
  ) { }
  create(createFollowDto: CreateFollowDto) {
    return 'This action adds a new follow';
  }

  async findAll(userId: string) {
    const result = await this.followModel.find({
      userId: new Types.ObjectId(userId),
    });
    const filter = result.map((x) => x.userFollowingId);
    return filter;
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

  async checkFollow(followerId: string, followingId: string) {
    const exsistFollowing = await this.followModel.findOne({
      userId: new Types.ObjectId(followerId),
      userFollowingId: new Types.ObjectId(followingId),
    });
    if (exsistFollowing) {
      return true;
    }
    return false;
  }

  async followAnotherUser(
    followerId: string,
    followingId: string,
  ): Promise<any> {
    if (!followerId || !followingId) {
      throw new BadRequestException('Missing field!!!');
    }
    const alreadyFollow = await this.checkFollow(followerId, followingId);
    if (alreadyFollow) {
      await this.followModel.deleteOne({
        userId: followerId,
        userFollowingId: followingId,
      });
      await this.userModel.findByIdAndUpdate(followerId, {
        $inc: { totalFollowings: -1 },
      });
      await this.userModel.findByIdAndUpdate(followingId, {
        $inc: { totalFollowers: -1 },
      });

      return { message: 'Unfollowed successfully' };
    }
    await this.followModel.create({
      userId: followerId,
      userFollowingId: followingId,
    });
    await this.userModel.findByIdAndUpdate(followerId, {
      $inc: { totalFollowings: 1 },
    });

    await this.userModel.findByIdAndUpdate(followingId, {
      $inc: { totalFollowers: 1 },
    });
    return { message: 'Followed successfully' };
  }

  async handleGetListVideoFollow(
    userId: string,
    current: number,
    pageSize: number,
  ) {
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const filter = {
      userId: userId,
    };

    const result = await this.followModel.find(filter).sort({ createAt: -1 });
    const arrIdFollow = result.map((item) => item.userFollowingId);
    console.log(arrIdFollow);

    const listVideo = await this.videoService.getVideoNearestByUserId(
      arrIdFollow,
      pageSize,
      current,
    );
    return listVideo;
  }

  async getFollowingList(userId: string) {
    const followingList = await this.followModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('userFollowingId', 'userName email image');
    return followingList.map((follow) => follow.userFollowingId);
  }

  async getFollowersList(userId: string) {
    const followersList = await this.followModel
      .find({ userFollowingId: new Types.ObjectId(userId) })
      .populate('userId', 'userName email image');
    return followersList.map((follow) => follow.userId);
  }

  // async getFollowersList(userId: string) {
  //   const followersList = await this.followModel
  //     .find({ userFollowingId: new Types.ObjectId(userId) })
  //     .populate('userId', 'userName email image');
  //   return followersList.map((follow) => follow.userId);
  // }
}
