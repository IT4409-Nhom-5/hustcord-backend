import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';  
import { ConfigModule, ConfigService } from '@nestjs/config';
import mongodbConfig from './config/mongodb.config';
import jwtConfig from './config/jwt.config';
import { HealthController } from './modules/health/health.controller';
import { AuthModule } from './modules/auth/auth.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mongodbConfig, jwtConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('mongodb.uri'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
