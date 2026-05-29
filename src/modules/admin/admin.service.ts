import { Injectable } from "@nestjs/common";
import { Op } from "sequelize";
import { User } from "../user/user.entity";
import { Channel } from "../channel/channel.entity";
import { Message } from "../message/message.entity";

@Injectable()
export class AdminService {
    async getAllUsers() {
        try {
            const users = await User.findAndCountAll({
                attributes: { exclude: ['password'] },
            });
            return users;
        } catch {
            return {
                statusCode: '404',
                message: 'Internal server error.'
            };
        }
    }
    
    async deleteUser(id: string) {
        // 1. Clear parentId on replies where the parent message was sent/received by this user
        await Message.update(
            { parentId: null },
            {
                where: {
                    [Op.or]: [
                        { userId: id },
                        { recipientId: id }
                    ]
                }
            }
        );

        // 2. Destroy all messages sent or received by this user
        await Message.destroy({
            where: {
                [Op.or]: [
                    { userId: id },
                    { recipientId: id }
                ]
            }
        });

        // 3. Destroy the user record
        await User.destroy({
            where: { id },
        });

        return {
            message: 'User deleted successfully.',
        };
    }

    async changeUserRole(
        id: string,
        role: 'user' | 'admin',
    ) {
        await User.update(
            { role },
            { where: { id } },
        );

        return {
            message: 'Role updated successfully.',
        };
    }

    // ================= CHANNELS =================

    async getAllChannels() {
        return await Channel.findAll();
    }

    async deleteChannel(id: string) {
        // 1. Clear parentId on replies in this channel to prevent self-reference constraint errors
        await Message.update({ parentId: null }, { where: { channelId: id } });

        // 2. Destroy all messages associated with the channel
        await Message.destroy({ where: { channelId: id } });

        // 3. Destroy the channel itself
        await Channel.destroy({
            where: { id },
        });

        return {
            message: 'Channel deleted successfully.',
        };
    }

    // ================= MESSAGES =================

    async deleteMessage(id: string) {
        await Message.destroy({
            where: { id },
        });

        return {
            message: 'Message deleted successfully.',
        };
    }

    // ================= DASHBOARD =================

    async dashboard() {
        const users = await User.count();
        const channels = await Channel.count();
        const messages = await Message.count();

        return {
            users,
            channels,
            messages,
        };
    }
}