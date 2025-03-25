import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';

import { KafkaService } from './kafka.service';
import { Public } from '@/decorator/customize';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';

interface UserAction {
  userId: string;
  action: string;
  timestamp: string;
  id?: string;
}
interface UserStats {
  userId: string;
  totalActions: number;
  actionCounts: { [key: string]: number };
}

interface HourlyStats {
  hour: string;
  stats: UserStats[];
}
interface MetadataStats {
  categories: { [category: string]: number };
  tags: { [tag: string]: number };
}
@Controller('kafka')
export class KafkaController {
  constructor(private readonly kafkaService: KafkaService) {}

  @Post('action')
  @UseGuards(JwtAuthGuard)
  async logUserAction(
    @Req() req: any,
    @Query('action') action: string,
    @Query('id') id?: string,
  ) {
    const timestamp = new Date().toISOString();
    const userId = req.user._id;
    await this.kafkaService.sendUserAction(userId, action, timestamp, id);
    return `Logged action for user ${userId}: ${action} at ${timestamp}`;
  }

  @Get('user-stats')
  getUserStatistics(): HourlyStats[] {
    return this.kafkaService.getUserStatistics();
  }
  @Get('video-stats')
  getVideoStatistics(): MetadataStats {
    return this.kafkaService.getVideoMetadataStats();
  }
  @Get('music-stats')
  getMusicMetadataStats(): MetadataStats {
    return this.kafkaService.getMusicMetadataStats();
  }
}
