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
                host: process.env.DB_HOST,
                port: Number(process.env.DB_PORT),
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                logging: console.log,
                
                dialectOptions: {
                    ssl: {
                        require: true,
                        rejectUnauthorized: false,
                    }
                },
                // dialectModule: require('pg'),

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