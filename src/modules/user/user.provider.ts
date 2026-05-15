import { User } from "./user.entity";

export const UserProviders = [
    {
        provide: 'USER_REPOSITORY',
        useValue: User,
        inject: ['SEQUELIZE'], // Ép hệ thống khởi tạo Database
    }
];