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

  async createChannel({ participants, admins, image, name, description }: ChannelDto) {
    try {
      const channel = await Channel.create({ participants, admins, image, name, description });
      console.log(channel)
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
  /* Admin */

  async addUserToChannel(
    channelId: string,
    userId: string
  ){
    try {
      const channel = await Channel.findByPk(channelId);
      if(!channel){
        return {
          statusCode: '404',
          message: 'Channel not found.'
        }
      }
      if(channel.participants.includes(userId)){
        return {
          statusCode: '400',
          message: 'User is already in channel.'
        }
      }
      channel.participants.push(userId);
      await channel.save();
      return {
        statusCode: '200',
        message: 'User added to channel successfully.'
      };
    } catch {
      return {
        statusCode: '500',
        message: 'Internal server error.'
      };
    }
  }
  async deleteChannel(id: string) {
    try {
      await Channel.destroy({ where: { id } });
      return {
        statusCode: '200',
        message: 'Channel deleted successfully.'
      };
    } catch {
      return {
        statusCode: '404',
        message: 'Channel not found.'
      };
    }
  }

  async addAdminToChannel(
    channelId: string,
    adminId: string, 
    userId: string,
  ) {
    try {
      const channel = await Channel.findByPk(channelId);
      if (!channel) {
        return {
          statusCode: '404',
          message: 'Channel not found.'
        };
      }
      const isAdmin = channel.admin.includes(adminId);
      if (!isAdmin) {
        return {
          statusCode: '403',
          message: 'Only admin can remove users.'
        };
      }

      if (!channel.participants.includes(userId)) {
        return {
          statusCode: '400',
          message: 'User is not in channel.'
        };
      }
      channel.admin.push(userId);
      await channel.save();
      return {
        statusCode: '200',
        message: 'Admin added succesfully.'
      };
    } catch {
      return {
        statusCode: '500',
        message: 'Internal server error.'
      };
    }
  }

  async removeUserFromChannel(
    channelId: string,
    adminId: string,
    userId: string,
  ) {
    try {
      const channel = await Channel.findByPk(channelId);

      if (!channel) {
        return {
          statusCode: '404',
          message: 'Channel not found.'
        };
      }

      const isAdmin = channel.admin.includes(adminId);

      if (!isAdmin) {
        return {
          statusCode: '403',
          message: 'Only admin can remove users.'
        };
      }

      if (!channel.participants.includes(userId)) {
        return {
          statusCode: '400',
          message: 'User is not in channel.'
        };
      }

      channel.participants = channel.participants.filter(
        (id: string) => id !== userId
      );

      channel.admin = channel.admin.filter(
        (id: string) => id !== userId
      );

      await channel.save();

      return {
        statusCode: '200',
        message: 'User removed successfully.'
      };
    } catch {
      return {
        statusCode: '500',
        message: 'Internal server error.'
      };
    }
  }

  /* User */
  async leaveChannel(channelId: string, userId: string) {
    try {
      const channel = await Channel.findByPk(channelId);
      if (!channel) {
        return {
          statusCode: '404',
          message: 'Channel not found.'
        };
      }
      if (!channel.participants.includes(userId)) {
        return {
          statusCode: '400',
          message: 'User is not in channel.'
        };
      }
      channel.participants = channel.participants.filter((id: string) => id !== userId);
      channel.admin = channel.admin.filter((id: string) => id !== userId);
      await channel.save();
      return {
        statusCode: '200',
        message: 'Left channel successfully.'
      };
    } catch {
      return {
        statusCode: '500',
        message: 'Internal server error.'
      };
    }
  }
}
