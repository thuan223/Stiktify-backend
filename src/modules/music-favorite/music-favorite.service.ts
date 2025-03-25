import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMusicFavoriteDto } from './dto/create-music-favorite.dto';
import { UpdateMusicFavoriteDto } from './dto/update-music-favorite.dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { MusicFavorite } from './schema/music-favorite.schema';
import { Music } from '../musics/schemas/music.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class MusicFavoriteService {
  constructor(
    @InjectModel(MusicFavorite.name)
    private MusicFavoriteModel: Model<MusicFavorite>,
    @InjectModel(Music.name) private MusicModel: Model<Music>,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  create(createMusicFavoriteDto: CreateMusicFavoriteDto) {
    return 'This action adds a new musicFavorite';
  }

  async findAll(userId: string) {
    const result = await this.MusicFavoriteModel.find({
      userId: new Types.ObjectId(userId),
    }).populate('musicId', 'musicDescription musicThumbnail musicUrl');
    return result.map((item) => item.musicId);
  }

  findOne(id: number) {
    return `This action returns a #${id} musicFavorite`;
  }

  update(id: number, updateMusicFavoriteDto: UpdateMusicFavoriteDto) {
    return `This action updates a #${id} musicFavorite`;
  }

  remove(id: number) {
    return `This action removes a #${id} musicFavorite`;
  }

  // async checkFavorite(favoriteId: string, favoritingId: string) {
  //   const exsistFollowing = await this.MusicFavoriteModel.findOne({
  //     userId: new Types.ObjectId(favoriteId),
  //     musicId: new Types.ObjectId(favoritingId)
  //   })
  //   if (exsistFollowing) {
  //     return true;
  //   }
  //   return false;
  // }

  // async handleMusicFavorite(favoriteId: string, favoritingId: string) {
  //     if (!favoriteId || !favoritingId) {
  //       throw new BadRequestException("Missing field!!!")
  //     }
  //     const alreadyFavorite = await this.checkFavorite(favoriteId, favoritingId)
  //     if (alreadyFavorite) {
  //       const unFavorite = await this.MusicFavoriteModel.deleteOne({
  //         userId: favoriteId,
  //         musicId: favoritingId
  //       })
  //       return unFavorite;
  //     }
  //     const favorite = await this.MusicFavoriteModel.create({
  //       userId: favoriteId,
  //       musicId: favoritingId,
  //     })
  //     return favorite;
  //   }

  async checkFavorite(userId: string, musicId: string): Promise<boolean> {
    if (
      !userId ||
      !musicId ||
      !Types.ObjectId.isValid(userId) ||
      !Types.ObjectId.isValid(musicId)
    ) {
      throw new BadRequestException('Invalid userId or musicId');
    }

    const existingFavorite = await this.MusicFavoriteModel.findOne({
      userId: new Types.ObjectId(userId),
      musicId: new Types.ObjectId(musicId),
    });
    const music: any = await this.MusicModel.findById(musicId).populate(
      'userId',
      '_id',
    );

    if (!music) {
      throw new Error('Music not exist');
    }

    const existingNotification =
      await this.notificationsService.findNotification({
        sender: userId,
        recipient: music.userId._id.toString(),
        type: 'new-music-favorite',
        musicId: music._id,
      });

    if (existingNotification) {
      return !!existingFavorite; // Nếu đã có, không gửi thông báo nữa
    }

    const notification = await this.notificationsService.createNotification({
      sender: userId,
      recipient: music.userId._id.toString(),
      type: 'new-music-favorite',
      musicId: music._id,
    });

    // Lấy dữ liệu thông báo đầy đủ
    const populatedNotification =
      await this.notificationsService.populateNotification(notification._id);
    console.log(populatedNotification);

    // Gửi thông báo realtime qua WebSocket
    this.notificationsGateway.sendNotification(
      userId,
      populatedNotification.recipient,
      populatedNotification,
    );
    return !!existingFavorite;
  }

  async handleMusicFavorite(userId: string, musicId: string) {
    if (!userId || !musicId) {
      throw new BadRequestException('Missing userId or musicId');
    }

    const alreadyFavorite = await this.checkFavorite(userId, musicId);

    if (alreadyFavorite) {
      // Xóa khỏi danh sách yêu thích
      const unFavorite = await this.MusicFavoriteModel.deleteOne({
        userId: new Types.ObjectId(userId),
        musicId: new Types.ObjectId(musicId),
      });

      // Giảm totalFavorite của bài hát
      await this.MusicModel.findByIdAndUpdate(
        musicId,
        { $inc: { totalFavorite: -1 } }, // Giảm totalFavorite đi 1
        { new: true },
      );

      return { message: 'Removed from favorites', success: true };
    } else {
      const favorite = await this.MusicFavoriteModel.create({
        userId: new Types.ObjectId(userId),
        musicId: new Types.ObjectId(musicId),
      });

      await this.MusicModel.findByIdAndUpdate(
        musicId,
        { $inc: { totalFavorite: 1 } }, // Tăng totalFavorite lên 1
        { new: true },
      );

      return favorite;
    }
  }
}
