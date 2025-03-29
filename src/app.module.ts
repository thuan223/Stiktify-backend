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
import { VideoReactionsModule } from './modules/video-reactions/video-reactions.module';
import { CommentReactionsModule } from './modules/comment-reactions/comment-reactions.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './auth/passport/jwt-auth.guard';
import { TransformInterceptor } from './auth/core/transform.interceptor';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { ViewingHistory } from './modules/viewinghistory/schemas/viewinghistory.entity';
import { ViewinghistoryModule } from './modules/viewinghistory/viewinghistory.module';
import { WishlistScoreModule } from './modules/wishlist-score/wishlist-score.module';
import { ReportModule } from './modules/report/report.module';
import { FollowModule } from './modules/follow/follow.module';
import { PlaylistsModule } from './modules/playlists/playlists.module';
import { StorePlaylistModule } from './modules/store-playlist/store-playlist.module';
import { UploadModule } from './modules/upload/upload.module';
import { MusicFavoriteModule } from './modules/music-favorite/music-favorite.module';
import { FriendRequestModule } from './modules/friend-request/friend-request.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ProductsModule } from './modules/products/products.module';
import { ProductCategoriesModule } from './modules/product-categories/product-categories.module';
import { CategoryProductsModule } from './modules/categories-products/category-products.module';
import { ListeninghistoryModule } from './modules/listeninghistory/listeninghistory.module';
import { SettingsModule } from './modules/settings/settings.module';
import { Neo4jModule } from './modules/neo4j/neo4j.module';
import { TickedUserModule } from './modules/ticked-user/ticked-user.module';
import { OrderModule } from './modules/order/order.module';
import { KafkaModule } from './modules/kafka/kafka.module';
import { RatingModule } from './modules/ratings/ratings.module';
import { ReactionTypesModule } from './modules/report/reaction-types/reaction-types.module';

@Module({
  imports: [
    RatingModule,
    OrderModule,
    Neo4jModule.forRootAsync(),
    UploadModule,
    ProductsModule,
    ProductCategoriesModule,
    CategoryProductsModule,
    StorePlaylistModule,
    PlaylistsModule,
    FollowModule,
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
    FriendRequestModule,
    NotificationsModule,
    KafkaModule,
    SettingsModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),
    TickedUserModule,
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
          from: '"Stiktify" <no-reply@localhost>',
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
    StorePlaylistModule,
    UploadModule,
    MusicFavoriteModule,
    ListeninghistoryModule,
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
export class AppModule { }
