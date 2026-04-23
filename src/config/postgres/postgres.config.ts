import { Sequelize } from "sequelize-typescript";
import { Channel } from "../../modules/channel/channel.entity";
import { User } from "../../modules/user/user.entity";
import { Message } from "../../modules/message/message.entity";

export const postgresProviders = [
    {
        provide: 'SEQUELIZE',
        useFactory: async () => {
            const sequelize = new Sequelize({
                dialect: 'postgres',
                // host: /* '192.168.1.75', */ 'localhost',
                host: 'localhost',
                port: 5432,
                username: 'postgres',
                password: process.env.POSTGRES_SQL_PASSWORD,
                database: 'hustcord',
                logging: console.log,
            });
            sequelize.addModels([User, Message, Channel]);
            await sequelize.sync();
            try {
                await sequelize.authenticate();
                console.log("DB connected");
            } catch(err){
                console.error("Err: ", err);
            }
            return sequelize;
            
        }
    }
];