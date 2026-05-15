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
                logging: false,
                
                dialectOptions: {
                    ssl: {
                        require: true,
                        rejectUnauthorized: false,
                    }
                },
                pool: {
                    max: 5,
                    min: 0,
                    acquire: 10000,
                    idle: 10000
                }
            });
            sequelize.addModels([User, Message, Channel]);
            
            try {
                await sequelize.authenticate();
                await sequelize.sync({ alter: true });
            } catch(err){
                throw err;
            }
            return sequelize;
            
        }
    }
];