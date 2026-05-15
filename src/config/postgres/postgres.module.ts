import { Module, Global } from '@nestjs/common';
import { postgresProviders } from './postgres.config';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [...postgresProviders],
  exports: [...postgresProviders]
})
export class PostgresModule {};
