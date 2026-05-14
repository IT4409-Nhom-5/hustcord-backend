import { Sequelize } from "sequelize-typescript";
import { Channel } from "../../modules/channel/channel.entity";
import { User } from "../../modules/user/user.entity";
import { Message } from "../../modules/message/message.entity";

export const postgresProviders = [
    {
        provide: 'SEQUELIZE',
        useFactory: async () => {
            console.log(`[DB] Attempting to connect to: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
            
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
            });

            try {
                // Phải authenticate TRƯỚC khi sync
                await sequelize.authenticate();
                console.log("✅ [DB] PostgreSQL connected successfully");
                
                sequelize.addModels([User, Message, Channel]);
                await sequelize.sync();
                console.log("✅ [DB] Models synced successfully");
            } catch(err){
                console.error("❌ [DB] Connection Error: ", err.message);
            }
            return sequelize;
        }
    }
];