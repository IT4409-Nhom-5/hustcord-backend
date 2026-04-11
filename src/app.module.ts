import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { GatewayModule } from './gateway/gateway.module';
import { MediaModule } from './media/media.module';
import { CommonModule } from './common/common.module';
import { MongooseModule } from '@nestjs/mongoose';  
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'), 
      }),
    }),

    UsersModule, 
    AuthModule, 
    ChatModule, 
    GatewayModule, 
    MediaModule, 
    CommonModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
