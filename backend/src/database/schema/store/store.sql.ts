import { pgTable } from 'drizzle-orm/pg-core';
import { baseColumns } from '../base-columns';
import { userTable } from '../user/user.sql';
import { index, primaryKey } from 'drizzle-orm/pg-core';
import { InferSelectModel } from 'drizzle-orm';

export const storeTable = pgTable(
  'stores',
  (pg) => ({
    ...baseColumns('store'),
    name: pg.varchar({ length: 50 }).notNull(),
    userId: pg
      .varchar({ length: 34 })
      .notNull()
      .references(() => userTable.id),
  }),
  (t) => [index().on(t.userId)],
);

export const storeDailySummaryTable = pgTable(
  'store_daily_summary',
  (pg) => ({
    storeId: pg
      .varchar({ length: 34 })
      .references(() => storeTable.id)
      .notNull(),
    date: pg.date().notNull(),
    totalRevenue: pg.numeric({ precision: 12, scale: 2 }).default('0'),
    pageViews: pg.bigint({ mode: 'number' }).default(0),
    addToCarts: pg.bigint({ mode: 'number' }).default(0),
    removeFromCarts: pg.bigint({ mode: 'number' }).default(0),
    checkoutsStarted: pg.bigint({ mode: 'number' }).default(0),
    purchases: pg.bigint({ mode: 'number' }).default(0),
  }),
  (t) => [
    primaryKey({ columns: [t.storeId, t.date] }),
    index().on(t.storeId, t.date),
  ],
);

export const storeProductSummaryTable = pgTable(
  'store_product_summary',
  (pg) => ({
    storeId: pg
      .varchar({ length: 34 })
      .references(() => storeTable.id)
      .notNull(),
    productId: pg.varchar({ length: 34 }).notNull(),
    totalRevenue: pg.numeric({ precision: 12, scale: 2 }).default('0'),
    totalOrders: pg.bigint({ mode: 'number' }).default(0),
  }),
  (t) => [
    primaryKey({ columns: [t.storeId, t.productId] }),
    index().on(t.storeId, t.totalRevenue),
  ],
);

export type Store = InferSelectModel<typeof storeTable>;
export type StoreDailySummary = InferSelectModel<typeof storeDailySummaryTable>;
export type StoreProductSummary = InferSelectModel<
  typeof storeProductSummaryTable
>;
