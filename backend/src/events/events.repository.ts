import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE, type DrizzleDB } from '../database/database.module';
import { CreateEventDto } from './dto/create-event.dto';
import {
  eventsTable,
  EventTypeEnum,
  storeDailySummaryTable,
  storeProductSummaryTable,
} from '../database/schema';
import { createId } from '../database/schema/id';
import { and, eq, sql } from 'drizzle-orm';

@Injectable()
export class EventsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async ingestEvent(storeId: string, createEventDto: CreateEventDto) {
    const { eventType, data, timestamp } = createEventDto;
    const eventDate = timestamp ? new Date(timestamp) : new Date();
    const today = eventDate.toISOString().split('T')[0];

    const isPurchase = eventType === EventTypeEnum.purchase;
    const purchaseAmount = isPurchase ? String(Number(data.amount)) : '0';
    const productId = isPurchase
      ? (data.productId as string | undefined)
      : undefined;

    await this.db.transaction(async (tx) => {
      await tx.insert(eventsTable).values({
        eventId: createId('event'),
        storeId,
        eventType,
        data,
        ...(timestamp && { timestamp: new Date(timestamp) }),
      });

      await tx
        .select()
        .from(storeDailySummaryTable)
        .where(
          and(
            eq(storeDailySummaryTable.storeId, storeId),
            eq(storeDailySummaryTable.date, today),
          ),
        )
        .for('update');

      await tx
        .insert(storeDailySummaryTable)
        .values({
          storeId,
          date: today,
          totalRevenue: purchaseAmount,
          pageViews: eventType === EventTypeEnum.page_view ? 1 : 0,
          addToCarts: eventType === EventTypeEnum.add_to_cart ? 1 : 0,
          removeFromCarts: eventType === EventTypeEnum.remove_from_cart ? 1 : 0,
          checkoutsStarted:
            eventType === EventTypeEnum.checkout_started ? 1 : 0,
          purchases: eventType === EventTypeEnum.purchase ? 1 : 0,
        })
        .onConflictDoUpdate({
          target: [storeDailySummaryTable.storeId, storeDailySummaryTable.date],
          set: {
            totalRevenue: sql`${storeDailySummaryTable.totalRevenue} + ${purchaseAmount}`,
            pageViews: sql`${storeDailySummaryTable.pageViews} + ${eventType === EventTypeEnum.page_view ? 1 : 0}`,
            addToCarts: sql`${storeDailySummaryTable.addToCarts} + ${eventType === EventTypeEnum.add_to_cart ? 1 : 0}`,
            removeFromCarts: sql`${storeDailySummaryTable.removeFromCarts} + ${eventType === EventTypeEnum.remove_from_cart ? 1 : 0}`,
            checkoutsStarted: sql`${storeDailySummaryTable.checkoutsStarted} + ${eventType === EventTypeEnum.checkout_started ? 1 : 0}`,
            purchases: sql`${storeDailySummaryTable.purchases} + ${eventType === EventTypeEnum.purchase ? 1 : 0}`,
          },
        });

      if (isPurchase && productId) {
        await tx
          .select()
          .from(storeProductSummaryTable)
          .where(
            and(
              eq(storeProductSummaryTable.storeId, storeId),
              eq(storeProductSummaryTable.productId, productId),
            ),
          )
          .for('update');

        await tx
          .insert(storeProductSummaryTable)
          .values({
            storeId,
            productId,
            totalRevenue: purchaseAmount,
            totalOrders: 1,
          })
          .onConflictDoUpdate({
            target: [
              storeProductSummaryTable.storeId,
              storeProductSummaryTable.productId,
            ],
            set: {
              totalRevenue: sql`${storeProductSummaryTable.totalRevenue} + ${purchaseAmount}`,
              totalOrders: sql`${storeProductSummaryTable.totalOrders}  + 1`,
            },
          });
      }
    });
  }
}
