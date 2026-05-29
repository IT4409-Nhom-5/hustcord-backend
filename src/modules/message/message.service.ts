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
        include: [
          { model: User, as: 'user' },
          { model: Message, as: 'parent', include: [{ model: User, as: 'user' }] }
        ]
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
          { model: User, as: 'user' },
          { model: Message, as: 'parent', include: [{ model: User, as: 'user' }] }
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

  async addMessage({ text, images, channelId, userId, recipientId, parentId }: MessageDto) {
    try {
      const message = await Message.create({ text, images, channelId, userId, recipientId, parentId });
      
      // Chỉ cập nhật bảng Channel nếu là tin nhắn trong kênh
      if (channelId) {
        await Channel.update(
          { messages: sequelize.fn('array_append', sequelize.col('messages'), message.id) },
          { where: { id: message.channelId } }
        );
      }
      
      const messageWithUser = await Message.findByPk(message.id, {
        include: [
          { model: User, as: 'user' },
          { model: Message, as: 'parent', include: [{ model: User, as: 'user' }] }
        ]
      });

      return {
        statusCode: '201',
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

  async deleteMessage({ id, userId }) {
    try {
      const message = await Message.findByPk(id);
      if (!message) {
        return {
          statusCode: 404,
          message: 'Message not found.'
        };
      }

      if (message.userId !== userId) {
        return {
          statusCode: 403,
          message: 'You can only recall your own messages.'
        };
      }

      message.text = '';
      message.images = [];
      message.isRecalled = true;
      await message.save();

      const updatedMessage = await Message.findByPk(id, {
        include: [
          { model: User, as: 'user' },
          { model: Message, as: 'parent', include: [{ model: User, as: 'user' }] }
        ]
      });

      return {
        statusCode: 200,
        message: 'Message recalled successfully.',
        data: updatedMessage
      };
    } catch (error) {
      console.error(">>> ERROR DELETING MESSAGE:", error);
      return {
        statusCode: 400,
        message: 'Failed to recall message.'
      };
    }
  }

  async toggleReaction({ id, emoji, userId, username }) {
    try {
      const message = await Message.findByPk(id);
      if (!message) {
        return {
          statusCode: 404,
          message: 'Message not found.'
        };
      }

      let reactions = message.reactions || [];
      if (!Array.isArray(reactions)) {
        reactions = [];
      }

      const reactionIdx = reactions.findIndex((r: any) => r.emoji === emoji);

      if (reactionIdx === -1) {
        reactions = [...reactions, {
          emoji,
          users: [{ id: userId, username }]
        }];
      } else {
        const reaction = reactions[reactionIdx];
        const userIdx = reaction.users.findIndex((u: any) => u.id === userId);

        if (userIdx === -1) {
          const updatedUsers = [...reaction.users, { id: userId, username }];
          reactions = reactions.map((r: any, i: number) => i === reactionIdx ? { ...r, users: updatedUsers } : r);
        } else {
          const updatedUsers = reaction.users.filter((u: any) => u.id !== userId);
          if (updatedUsers.length === 0) {
            reactions = reactions.filter((_: any, i: number) => i !== reactionIdx);
          } else {
            reactions = reactions.map((r: any, i: number) => i === reactionIdx ? { ...r, users: updatedUsers } : r);
          }
        }
      }

      message.reactions = reactions;
      await message.save();

      const updatedMessage = await Message.findByPk(id, {
        include: [
          { model: User, as: 'user' },
          { model: Message, as: 'parent', include: [{ model: User, as: 'user' }] }
        ]
      });

      return {
        statusCode: 200,
        message: 'Reaction updated successfully.',
        data: updatedMessage
      };
    } catch (error) {
      console.error(">>> ERROR TOGGLING REACTION IN DB:", error);
      return {
        statusCode: 500,
        message: error.message
      };
    }
  }
}
