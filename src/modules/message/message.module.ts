import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { UserModule } from '../user/user.module';
import { MessageProvider } from './message.provider';
@Module({
  imports: [UserModule],
  controllers: [MessageController],
  providers: [MessageService, ...MessageProvider],
  exports: [MessageService]
})
export class MessageModule {}
