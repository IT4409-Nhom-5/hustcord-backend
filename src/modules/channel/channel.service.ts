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
      const generalChannels = await Channel.findAll({
        where: {
          participants: {
            [Op.contains]: [userId]
          }
        },
        order: [['updatedAt', 'DESC']],
        attributes: { exclude: ['messages', 'createdAt'] }
      });

      const resolvedGeneralChannels: any[] = [];
      for (const ch of generalChannels) {
        const jsonCh = ch.toJSON() as any;
        const resolvedParticipants: User[] = [];
        if (jsonCh.participants) {
          for (const pId of jsonCh.participants) {
            const user = await User.findByPk(pId, {
              attributes: ['id', 'username', 'email', 'image']
            });
            if (user) {
              resolvedParticipants.push(user);
            }
          }
        }
        jsonCh.participants = resolvedParticipants;
        resolvedGeneralChannels.push(jsonCh);
      }

      const guildIds = generalChannels
        .map(c => c.guildId)
        .filter(id => !!id);

      let subChannels: Channel[] = [];
      if (guildIds.length > 0) {
        subChannels = await Channel.findAll({
          where: {
            guildId: {
              [Op.in]: guildIds
            },
            id: {
              [Op.notIn]: generalChannels.map(c => c.id)
            }
          },
          attributes: { exclude: ['messages', 'createdAt'] }
        });
      }

      const lastMessages: any[] = [];
      for (let i = 0; i < generalChannels.length; i++) {
        const lastMessage = await Message.findOne({
          where: { channelId: generalChannels[i].id },
          order: [['createdAt', 'DESC']]
        });
        lastMessages.push(lastMessage);
      }

      return {
        lastMessages,
        generalChannels: resolvedGeneralChannels,
        subChannels
      };
    } catch (err) {
      console.error('[ChannelService] error in getChannelsByUser:', err);
      return {
        statusCode: '404',
        message: 'User or channel not found.'
      };
    }
  }

  async createChannel({participants, admins, image, name, description, guildId}: ChannelDto) {
    try {
      let resolvedParticipants = [...(participants || [])];
      
      // If it is a new guild general channel, we automatically add creator's friends
      if (guildId && participants && participants.length > 0) {
        const creatorId = participants[0];
        const creator = await User.findByPk(creatorId);
        if (creator && creator.friends && creator.friends.length > 0) {
          for (const friendId of creator.friends) {
            if (!resolvedParticipants.includes(friendId)) {
              resolvedParticipants.push(friendId);
            }
          }
        }
      }

      const channel = await Channel.create({
        participants: resolvedParticipants,
        admins,
        image,
        name,
        description,
        guildId
      });
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

  async deleteChannel(id: string) {
    try {
      // 1. Clear parentId on replies in this channel to prevent self-reference constraint errors
      await Message.update({ parentId: null }, { where: { channelId: id } });

      // 2. Destroy all messages associated with the channel
      await Message.destroy({ where: { channelId: id } });

      // 3. Destroy the channel itself
      await Channel.destroy({ where: { id } });

      return {
        statusCode: '200',
        message: 'Channel deleted successfully.'
      };
    } catch (error) {
      console.error(`[ChannelService] Failed to delete channel ${id}:`, error);
      return {
        statusCode: '500',
        message: 'Failed to delete channel.'
      };
    }
  }
}
