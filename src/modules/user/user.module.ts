import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserProviders } from "./user.provider";
import { PostgresModule } from "../../config/postgres/postgres.module";
import { UserController } from "./user.controller";

@Module({
    imports: [PostgresModule],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {}