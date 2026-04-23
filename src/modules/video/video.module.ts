import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { VideoGateway } from './video.gateway';

@Module({
  imports: [],
  controllers: [VideoController],
  providers: [VideoService, VideoGateway],
  exports: [VideoService],
})
export class VideoModule {}
