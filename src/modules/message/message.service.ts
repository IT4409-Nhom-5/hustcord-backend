import { Injectable, HttpStatus } from '@nestjs/common';
import { validate as isUuid } from 'uuid';
import sequelize from 'sequelize';
import { Channel } from '../channel/channel.entity';
import { User } from '../user/user.entity';
import { MessageDto } from './dto/message.dto';
import { Message } from './message.entity';

@Injectable()
export class MessageService {
  async getMessage({ id }) {
    try {
      const message = await Message.findByPk(id, { include: [User] });
      return message;
    } catch (error) {
      return {
        statusCode: '404',
        message: 'Message not found.'
      };
    }
  }

  async getMessagesByChannel({ id }) {
    if (!id || !isUuid(id)) {
      return {
        statusCode: 400,
        message: 'Invalid channel ID format. Must be a UUID.'
      };
    }
    try {
      const messages = await Message.findAll({
        where: { channelId: id },
        order: [['createdAt', 'ASC']],
        include: [{ model: User, as: 'user' }]
      });
      return messages;
    } catch (error) {
      throw error;
    }
  }

  async getDirectMessages({ userId, recipientId }) {
    try {
      const messages = await Message.findAll({
        where: {
          [sequelize.Op.or]: [
            { userId: userId, recipientId: recipientId },
            { userId: recipientId, recipientId: userId }
          ]
        },
        order: [['createdAt', 'ASC']],
        include: [
          { model: User, as: 'user' }
        ]
      });
      return messages;
    } catch (error) {
      return {
        statusCode: 400,
        message: error
      };
    }
  }

  async addMessage({ text, images, channelId, userId, recipientId }: MessageDto) {
    
    // Validate IDs
    if (channelId && !isUuid(channelId)) {
       return { statusCode: 400, message: 'Invalid channelId format' };
    }
    if (!isUuid(userId)) {
       return { statusCode: 400, message: 'Invalid userId format' };
    }
    if (recipientId && !isUuid(recipientId)) {
       return { statusCode: 400, message: 'Invalid recipientId format' };
    }

    try {
      const message = await Message.create({ 
        text, 
        images: images || [], // Đảm bảo luôn là mảng
        channelId: channelId || null, 
        userId, 
        recipientId: recipientId || null 
      });
      
      if (channelId) {
        await Channel.update(
          { messages: sequelize.fn('array_append', sequelize.col('messages'), message.id) },
          { where: { id: message.channelId } }
        );
      }
      
      const messageWithUser = await Message.findByPk(message.id, { include: ['user'] });

      return {
        statusCode: 201,
        message: 'Message created successfully.',
        data: messageWithUser
      };
    } catch (error) {
      throw error;
    }
  }

  async updateMessage({ id, message }) {
    try {
      await Message.update(message, { where: { id } });
      return {
        statusCode: '200',
        message: 'Message updated successfully.'
      };
    } catch {
      return {
        statusCode: '404',
        message: 'Message not found.'
      };
    }
  }

  async deleteMessage({ id }) {
    try {
      await Message.destroy({ where: { id } });
      return {
        statusCode: '200',
        message: 'Message deleted successfully.'
      };
    } catch {
      return {
        statusCode: '404',
        message: 'Message not found.'
      };
    }
  }
}
