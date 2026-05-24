import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, HttpStatus, Inject, forwardRef, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { MessageService } from './message.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MessageDto } from './dto/message.dto';
import { ChannelGateway } from '../channel/channel.gateway';

@ApiTags('messages')
@Controller('messages')
export class MessageController {
  constructor(
    private messageService: MessageService,
    @Inject(forwardRef(() => ChannelGateway))
    private channelGateway: ChannelGateway,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getMessage(@Param('id') id: string) {
    const message = await this.messageService.getMessage({ id });
    return message;
  }

  @Get('channel/:id')
  async getMessagesByChannel(@Param('id') id: string) {
    const message = await this.messageService.getMessagesByChannel({ id });
    return message;
  }

  @Get('direct/:userId/:recipientId')
  async getDirectMessages(@Param('userId') userId: string, @Param('recipientId') recipientId: string) {
    const messages = await this.messageService.getDirectMessages({ userId, recipientId });
    return messages;
  }

  @Post('')
  async createMessage(@Body() body: MessageDto) {
    const result = await this.messageService.addMessage(body);

    if (result.statusCode == 201 && result.data) {
      this.channelGateway.emitMessage(result.data);
    }

    return result;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateMessage(@Param('id') id: string, @Body() body: MessageDto) {
    const result = await this.messageService.updateMessage({ id, message: body });
    return result;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteMessage(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    const result = await this.messageService.deleteMessage({ id, userId });
    
    if (result.statusCode == 200 && result.data) {
      this.channelGateway.emitMessageUpdate(result.data);
    }
    
    return result;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/react')
  async toggleReaction(@Param('id') id: string, @Body('emoji') emoji: string, @Req() req: any) {
    const userId = req.user.id;
    const username = req.user.username;
    const result = await this.messageService.toggleReaction({ id, emoji, userId, username });

    if (result.statusCode == 200 && result.data) {
      this.channelGateway.emitMessageUpdate(result.data);
    }

    return result;
  }
}
