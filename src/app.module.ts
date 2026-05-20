import mongodbConfig from './config/mongodb.config';
import jwtConfig from './config/jwt.config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';  
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HealthController } from './modules/health/health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { PostgresModule } from './config/postgres/postgres.module';
import { AuthController } from './modules/auth/auth.controller';
import { ChannelModule } from './modules/channel/channel.module';
import { MessageModule } from './modules/message/message.module';
import { UserModule } from './modules/user/user.module';
import { VideoModule } from './modules/video/video.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
    }),
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     uri: configService.get('mongodb.uri'),
    //   }),
    //   inject: [ConfigService],
    // }),
    PostgresModule,
    AuthModule,
    ChannelModule,
    MessageModule,
    UserModule,
    VideoModule,
  ],
  controllers: [AppController, HealthController, AuthController],
  providers: [AppService],
})
export class AppModule {}
