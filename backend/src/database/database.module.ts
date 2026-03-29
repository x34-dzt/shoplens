import { Global, Logger, Module, Provider } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

export const DRIZZLE = 'DRIZZLE';

const DrizzleProvider: Provider = {
  provide: DRIZZLE,
  useFactory: () => {
    const logger = new Logger('DatabaseModule');
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      logger.error('DATABASE_URL is not provided');
      throw new Error('DATABASE_URL is not provided');
    }
    const pool = new Pool({
      connectionString,
    });
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
