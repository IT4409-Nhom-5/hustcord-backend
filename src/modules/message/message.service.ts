import { Injectable } from '@nestjs/common';
import sequelize from 'sequelize';
import { Channel } from '../channel/channel.entity';
import { User } from '../user/user.entity';
import { MessageDto } from './dto/message.dto';
import { Message } from './message.entity';

@Injectable()
export class MessageService {
  async getMessage({ id }) {
    try {
      const message = await Message.findByPk(id);
      return message;
    } catch (error) {
      return {
        statusCode: '404',
        message: 'Message not found.'
      };
    }
  }

  async getMessagesByChannel({ id }) {
    try {
      const messages = await Message.findAll({
        where: { channelId: id },
        order: [['createdAt', 'ASC']],
        include: User
      });
      return messages;
    } catch (error) {
      return {
        statusCode: '404',
        message: 'Message not found.'
      };
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
    try {
      const message = await Message.create({ text, images, channelId, userId, recipientId });
      
      // Chỉ cập nhật bảng Channel nếu là tin nhắn trong kênh
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
      console.error(">>> ERROR CREATING MESSAGE IN DB:", error);
      return {
        statusCode: 400,
        message: error
      };
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
