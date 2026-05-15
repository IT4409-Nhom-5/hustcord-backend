import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { Message } from '../message/message.entity';
import { User } from '../user/user.entity';
import { Channel } from './channel.entity';
import { ChannelDto } from './dto/channel.dto';

@Injectable()
export class ChannelService {
  async getChannel(id: string) {
    try {
      const channel = await Channel.findByPk(id);
      const participants: any[] = [];

      for (let i = 0; i < channel.participants.length; i++) {
        const user = await User.findByPk(channel.participants[i]);
        participants.push(user);
      }

      channel.participants = participants;
      return channel;
    } catch {
      return {
        statusCode: '404',
        message: 'Channel not found.'
      };
    }
  }

  async getChannelsByUser(userId: string) {
    try {
      const channels = await Channel.findAll({
        where: {
          participants: {
            [Op.contains]: [userId]
          }
        },
        order: [['updatedAt', 'DESC']],
        attributes: { exclude: ['messages', 'createdAt'] }
      });
      const lastMessages: any[] = [];
      for (let i = 0; i < channels.length; i++) {
        const lastMessage = await Message.findOne({
          where: { channelId: channels[i].id },
          order: [['createdAt', 'DESC']]
        });
        lastMessages.push(lastMessage);
      }

      return {
        lastMessages,
        channels
      };
    } catch {
      return {
        statusCode: '404',
        message: 'User or channel not found.'
      };
    }
  }

  async createChannel({participants, admins, image, name, description, guildId}: ChannelDto) {
    try {
      const channel = await Channel.create({participants, admins, image, name, description, guildId});
      console.log('Channel Created:', channel.id, 'in Guild:', guildId);
      return {
        statusCode: '201',
        message: 'Channel created successfully.',
        channel
      };
    } catch (error) {
      return {
        status: '400',
        message: error
      };
    }
  }

  async updateChannel({ id, channel }) {
    try {
      await Channel.update(channel, { where: { id } });
      return {
        statusCode: '200',
        message: 'Channel updated successfully.'
      };
    } catch {
      return {
        statusCode: '404',
        message: 'Channel not found.'
      };
    }
  }

  async deleteChannel(id: string) {
    try {
      const channel = await Channel.findByPk(id);
      if (!channel) return { statusCode: '404', message: 'Channel not found.' };
      
      const guildId = channel.guildId;
      await Channel.destroy({ where: { id } });
      
      return {
        statusCode: '200',
        message: 'Channel deleted successfully.',
        guildId
      };
    } catch {
      return {
        statusCode: '404',
        message: 'Channel not found.'
      };
    }
  }
}
