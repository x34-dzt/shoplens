import { pgTable, index, pgEnum } from 'drizzle-orm/pg-core';
import { storeTable } from '../store/store.sql';

export enum EventTypeEnum {
  page_view = 'page_view',
  add_to_cart = 'add_to_cart',
  remove_from_cart = 'remove_from_cart',
  checkout_started = 'checkout_started',
  purchase = 'purchase',
}

export const eventTypeEnum = pgEnum('event_type', [
  EventTypeEnum.page_view,
  EventTypeEnum.add_to_cart,
  EventTypeEnum.remove_from_cart,
  EventTypeEnum.checkout_started,
  EventTypeEnum.purchase,
]);

export type EventType = EventTypeEnum;

export const eventsTable = pgTable(
  'events',
  (pg) => ({
    eventId: pg.varchar({ length: 34 }).primaryKey(),
    storeId: pg
      .varchar({ length: 34 })
      .notNull()
      .references(() => storeTable.id),
    eventType: eventTypeEnum().notNull(),
    timestamp: pg.timestamp({ withTimezone: true }).notNull().defaultNow(),
    data: pg.jsonb().notNull(),
  }),
  (t) => [
    index().on(t.storeId, t.timestamp),
    index().on(t.storeId, t.eventType, t.timestamp),
  ],
);
