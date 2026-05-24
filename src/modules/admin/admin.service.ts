import { Injectable } from "@nestjs/common";
import { User } from "../user/user.entity";
import { Channel } from "../channel/channel.entity";
import { Message } from "../message/message.entity";
import { CreatedAt } from "sequelize-typescript";
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