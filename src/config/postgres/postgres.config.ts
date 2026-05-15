import { Sequelize } from "sequelize-typescript";
import { Channel } from "../../modules/channel/channel.entity";
import { User } from "../../modules/user/user.entity";
import { Message } from "../../modules/message/message.entity";

export const postgresProviders = [
    {
        provide: 'SEQUELIZE',
        useFactory: async () => {
            console.log(">>> Connecting to DB:", process.env.DB_HOST);
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
                console.log(">>> Authenticating DB...");
                await sequelize.authenticate();
                console.log(">>> DB connected (Authenticated)");
                
                // Bỏ qua lệnh sync() vì đã có sẵn bảng trên Supabase
                console.log(">>> Skipping Sync (Schema is already up-to-date)");
            } catch(err){
                console.error(">>> DB Connection Error: ", err);
            }
            return sequelize;
            
        }
    }
];