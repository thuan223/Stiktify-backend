import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';
import * as fs from 'fs';
import { VideoCategoriesService } from '../video-categories/video-categories.service';
import { ShortVideosService } from '../short-videos/short-videos.service';
import { CategoriesService } from '../categories/categories.service';
import { MusicCategoriesService } from '../music-categories/music-categories.service';
import { MusicsService } from '../musics/musics.service';

interface UserAction {
  userId: string;
  action: string;
  timestamp: string;
  id?: string;
  category?: string[];
  tags?: string[];
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

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private dailyActions: UserAction[] = [];
  private videoMetadata: UserAction[] = [];
  private musicMetadata: UserAction[] = [];

  constructor(
    private videoCategoriesService: VideoCategoriesService,
    private shortVideoService: ShortVideosService,
    private categoryService: CategoriesService,
    private musicCategoriesService: MusicCategoriesService, 
    private musicService: MusicsService,
  ) {
    this.kafka = new Kafka({
      clientId: 'nestjs-app',
      brokers: ['localhost:9092'],
    });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'user-action-group' });
  }

  async onModuleInit() {
    await this.producer.connect();
    await this.consumer.connect();
    console.log('Kafka Producer and Consumer connected');

    await this.consumer.subscribe({
      topic: 'user-actions',
      fromBeginning: false,
    });
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const action = JSON.parse(
          message.value?.toString() || '{}',
        ) as UserAction;
        this.dailyActions.push(action);
        if (action.action === 'view' && (action.category || action.tags)) {
          this.videoMetadata.push(action);
        } else if (
          action.action === 'listen' &&
          (action.category || action.tags)
        ) {
          this.musicMetadata.push(action); 
        }
      },
    });

    setInterval(
      () => {
        this.saveDailyLog();
        this.saveVideoMetadataLog();
        this.saveMusicMetadataLog(); 
      },
      60 * 60 * 24 * 1000,
    );
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  async sendUserAction(
    userId: string,
    action: string,
    timestamp: string,
    id?: string,
  ) {
    if (action === 'view' && id) {
      const categoriesData =
        await this.videoCategoriesService.findVideoCategoriesById(id);
      const categoryNamesPromises = categoriesData.map(async (cat) => {
        const category = await this.categoryService.getCategoryById(
          cat.categoryId.toString(),
        );
        return category?.categoryName || '';
      });
      const categoryNames = (await Promise.all(categoryNamesPromises)).filter(
        (name) => name,
      );

      const video = await this.shortVideoService.findVideoById(id);
      const tags = video.videoTag || [];

      await this.handleSendUserAction(
        userId,
        action,
        timestamp,
        categoryNames,
        tags,
      );
    } else if (action === 'listen' && id) {
      const categoriesData =
        await this.musicCategoriesService.getMusicCategoriesByMusicId(id);
      const categoryNamesPromises = categoriesData.map(async (cat) => {
        const category = await this.categoryService.getCategoryById(
          cat.categoryId.toString(),
        );
        return category?.categoryName || '';
      });
      const categoryNames = (await Promise.all(categoryNamesPromises)).filter(
        (name) => name,
      );

      const music = await this.musicService.getMusicById(id);
      const tags = music.musicTag || [];

      await this.handleSendUserAction(
        userId,
        action,
        timestamp,
        categoryNames,
        tags,
      );
    } else {
      await this.handleSendUserAction(userId, action, timestamp);
    }
  }

  async handleSendUserAction(
    userId: string,
    action: string,
    timestamp: string,
    category?: string[],
    tags?: string[],
  ) {
    const message = JSON.stringify({
      userId,
      action,
      timestamp,
      category,
      tags,
    });
    await this.producer.send({
      topic: 'user-actions',
      messages: [{ value: message }],
    });
  }

  private saveDailyLog() {
    if (this.dailyActions.length > 0) {
      const data = this.dailyActions
        .map((a) => `${a.userId},${a.action},${a.timestamp}`)
        .join('\n');
      fs.appendFileSync('daily-user-actions.log', data + '\n');
      this.dailyActions = [];
    }
  }

  private saveVideoMetadataLog() {
    if (this.videoMetadata.length > 0) {
      const data = this.videoMetadata
        .map(
          (a) =>
            `${a.userId},${a.timestamp},${(a.category || []).join('|')},${(a.tags || []).join('|')}`,
        )
        .join('\n');
      fs.appendFileSync('video-metadata.log', data + '\n');
      this.videoMetadata = [];
    }
  }

  private saveMusicMetadataLog() {
    if (this.musicMetadata.length > 0) {
      const data = this.musicMetadata
        .map(
          (a) =>
            `${a.userId},${a.timestamp},${(a.category || []).join('|')},${(a.tags || []).join('|')}`,
        )
        .join('\n');
      fs.appendFileSync('music-metadata.log', data + '\n');
      this.musicMetadata = [];
    }
  }

  getUserStatistics(
    date: string = new Date().toISOString().slice(0, 10),
  ): HourlyStats[] {
    const filePath = 'daily-user-actions.log';
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent
      .trim()
      .split('\n')
      .filter((line) => line);

    const actions: UserAction[] = lines.map((line) => {
      const [userId, action, timestamp] = line.split(',', 3); 
      return { userId, action, timestamp };
    });

    const filteredActions = actions.filter((action) =>
      action.timestamp.startsWith(date),
    );

    const hourlyMap = new Map<string, Map<string, UserStats>>();
    filteredActions.forEach(({ userId, action, timestamp }) => {
      const hour = timestamp.slice(0, 13); 

      if (!hourlyMap.has(hour)) {
        hourlyMap.set(hour, new Map<string, UserStats>());
      }

      const userMap = hourlyMap.get(hour)!;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          userId,
          totalActions: 0,
          actionCounts: {},
        });
      }

      const userStats = userMap.get(userId)!;
      userStats.totalActions += 1;
      userStats.actionCounts[action] =
        (userStats.actionCounts[action] || 0) + 1;
    });

    const result: HourlyStats[] = [];
    hourlyMap.forEach((userMap, hour) => {
      result.push({
        hour,
        stats: Array.from(userMap.values()),
      });
    });

    return result;
  }

  getVideoMetadataStats(): MetadataStats {
    const filePath = 'video-metadata.log';
    if (!fs.existsSync(filePath)) {
      return { categories: {}, tags: {} };
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent
      .replace(/\r/g, '')
      .trim()
      .split('\n')
      .filter((line) => line);

    const metadata: UserAction[] = lines.map((line) => {
      const [userId, timestamp, category, tags] = line.split(',', 4);
      return {
        userId,
        action: 'view',
        timestamp,
        category: category
          ? category.split('|').map((cat) => cat.trim())
          : undefined,
        tags: tags ? tags.split('|').map((tag) => tag.trim()) : undefined,
      };
    });

    const categories: { [category: string]: number } = {};
    const tags: { [tag: string]: number } = {};

    metadata.forEach(({ category, tags: videoTags }) => {
      if (category && category.length > 0) {
        category.forEach((cat) => {
          categories[cat] = (categories[cat] || 0) + 1;
        });
      }
      if (videoTags && videoTags.length > 0) {
        videoTags.forEach((tag) => {
          tags[tag] = (tags[tag] || 0) + 1;
        });
      }
    });

    return { categories, tags };
  }

  getMusicMetadataStats(): MetadataStats {
    const filePath = 'music-metadata.log';
    if (!fs.existsSync(filePath)) {
      return { categories: {}, tags: {} };
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent
      .replace(/\r/g, '')
      .trim()
      .split('\n')
      .filter((line) => line);

    const metadata: UserAction[] = lines.map((line) => {
      const [userId, timestamp, category, tags] = line.split(',', 4);
      return {
        userId,
        action: 'listen',
        timestamp,
        category: category
          ? category.split('|').map((cat) => cat.trim())
          : undefined,
        tags: tags ? tags.split('|').map((tag) => tag.trim()) : undefined,
      };
    });

    const categories: { [category: string]: number } = {};
    const tags: { [tag: string]: number } = {};

    metadata.forEach(({ category, tags: musicTags }) => {
      if (category && category.length > 0) {
        category.forEach((cat) => {
          categories[cat] = (categories[cat] || 0) + 1;
        });
      }
      if (musicTags && musicTags.length > 0) {
        musicTags.forEach((tag) => {
          tags[tag] = (tags[tag] || 0) + 1;
        });
      }
    });

    return { categories, tags };
  }
}
