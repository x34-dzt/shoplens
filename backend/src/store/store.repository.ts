import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE, type DrizzleDB } from '../database/database.module';
import { storeTable } from '../database/schema';
import { eq } from 'drizzle-orm';
import { createId } from '../database/schema/id';

@Injectable()
export class StoreRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findById(storeId: string) {
    const rows = await this.db
      .select()
      .from(storeTable)
      .where(eq(storeTable.id, storeId))
      .limit(1);
    return rows[0] ?? null;
  }

  async create(name: string, userId: string) {
    const rows = await this.db
      .insert(storeTable)
      .values({ id: createId('store'), name, userId })
      .returning();
    return rows[0];
  }

  async findByUserId(userId: string) {
    const rows = await this.db
      .select()
      .from(storeTable)
      .where(eq(storeTable.userId, userId))
      .limit(1);
    return rows[0] ?? null;
  }
}
