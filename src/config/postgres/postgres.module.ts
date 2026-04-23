import { Module } from '@nestjs/common';
import { postgresProviders } from './postgres.config';

@Module({
  imports: [],
  controllers: [],
  providers: [...postgresProviders],
  exports: [...postgresProviders]
})
export class PostgresModule {};
