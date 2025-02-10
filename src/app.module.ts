import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ChatsModule } from './modules/chats/chats.module';
import { MusicsModule } from './modules/musics/musics.module';
import { ShortVideosModule } from './modules/short-videos/short-videos.module';
import { CommentsModule } from './modules/comments/comments.module';
import { MusicCategoriesModule } from './modules/music-categories/music-categories.module';
import { VideoCategoriesModule } from './modules/video-categories/video-categories.module';
import { ReactionTypesModule } from './modules/reaction-types/reaction-types.module';
import { VideoReactionsModule } from './modules/video-reactions/video-reactions.module';
import { CommentReactionsModule } from './modules/comment-reactions/comment-reactions.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './auth/passport/jwt-auth.guard';
import { TransformInterceptor } from './auth/core/transform.interceptor';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { UploadMiddleware } from './middlewares/upload.middleware';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { ViewingHistory } from './modules/viewinghistory/schemas/viewinghistory.entity';
import { ViewinghistoryModule } from './modules/viewinghistory/viewinghistory.module';
import { WishlistScoreModule } from './modules/wishlist-score/wishlist-score.module';
import { ReportModule } from './modules/report/report.module';
@Module({
  imports: [
    AuthModule,
    UsersModule,
    CategoriesModule,
    MessagesModule,
    ChatsModule,
    MusicsModule,
    ShortVideosModule,
    CommentsModule,
    MusicCategoriesModule,
    VideoCategoriesModule,
    ReactionTypesModule,
    VideoReactionsModule,
    CommentReactionsModule,
    WishlistModule,
    ViewinghistoryModule,
    WishlistScoreModule,
    ReportModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          // ignoreTLS: true,
          secure: true,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@localhost>',
        },
        // preview: true,
        template: {
          dir: process.cwd() + '/src/mail/templates/',
          adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UploadMiddleware).forRoutes('*'); // Áp dụng middleware cho tất cả các route (hoặc route cụ thể)
  }
}
