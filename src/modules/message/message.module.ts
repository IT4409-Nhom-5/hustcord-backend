import { Module, forwardRef } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { UserModule } from '../user/user.module';
import { MessageProvider } from './message.provider';
import { ChannelModule } from '../channel/channel.module';
@Module({
  imports: [UserModule, forwardRef(() => ChannelModule)],
  controllers: [MessageController],
  providers: [MessageService, ...MessageProvider],
  exports: [MessageService]
})
export class MessageModule {}
