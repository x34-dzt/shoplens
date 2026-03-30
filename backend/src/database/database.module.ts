import { Global, Logger, Module, Provider } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ConfigType } from '@nestjs/config';
import databaseConfig from '../config/database.config';

export const DRIZZLE = 'DRIZZLE';

export type DrizzleDB = NodePgDatabase<typeof schema>;

const DrizzleProvider: Provider = {
  provide: DRIZZLE,
  inject: [databaseConfig.KEY],
  useFactory: (config: ConfigType<typeof databaseConfig>) => {
    const logger = new Logger('DatabaseModule');
    const pool = new Pool({ connectionString: config.url });
    const db = drizzle(pool, { casing: 'snake_case' });
    logger.log('Connected to the postgres successfully');
    return db;
  },
};

@Global()
@Module({
  providers: [DrizzleProvider],
  exports: [DrizzleProvider],
})
export class DatabaseModule {}
