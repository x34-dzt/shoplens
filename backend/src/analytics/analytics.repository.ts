import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE, type DrizzleDB } from '../database/database.module';
import {
  eventsTable,
  StoreDailySummary,
  storeDailySummaryTable,
  storeProductSummaryTable,
} from '../database/schema';
import { and, desc, eq, gte } from 'drizzle-orm';

@Injectable()
export class AnalyticsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async getOverview(storeId: string) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

    const rows = await this.db
      .select()
      .from(storeDailySummaryTable)
      .where(
        and(
          eq(storeDailySummaryTable.storeId, storeId),
          gte(storeDailySummaryTable.date, startOfMonthStr),
        ),
      );

    const todayRows = rows.filter((r) => r.date === today);
    const weekRows = rows.filter((r) => r.date >= startOfWeekStr);
    const monthRows = rows;

    const sumRevenue = (rs: StoreDailySummary[]) =>
      rs.reduce((acc, r) => acc + Number(r.totalRevenue ?? 0), 0);

    const totalPageViews = todayRows.reduce(
      (acc, r) => acc + Number(r.pageViews ?? 0),
      0,
    );
    const totalPurchases = todayRows.reduce(
      (acc, r) => acc + Number(r.purchases ?? 0),
      0,
    );
    const totalAddToCarts = todayRows.reduce(
      (acc, r) => acc + Number(r.addToCarts ?? 0),
      0,
    );
    const totalRemoveFromCarts = todayRows.reduce(
      (acc, r) => acc + Number(r.removeFromCarts ?? 0),
      0,
    );
    const totalCheckoutsStarted = todayRows.reduce(
      (acc, r) => acc + Number(r.checkoutsStarted ?? 0),
      0,
    );

    const conversionRate =
      totalPageViews > 0
        ? Number(((totalPurchases / totalPageViews) * 100).toFixed(2))
        : 0;

    return {
      revenue: {
        today: sumRevenue(todayRows),
        week: sumRevenue(weekRows),
        month: sumRevenue(monthRows),
      },
      conversionRate,
      eventCounts: {
        pageViews: totalPageViews,
        addToCarts: totalAddToCarts,
        removeFromCarts: totalRemoveFromCarts,
        checkoutsStarted: totalCheckoutsStarted,
        purchases: totalPurchases,
      },
    };
  }

  async getTopProducts(storeId: string) {
    return this.db
      .select()
      .from(storeProductSummaryTable)
      .where(eq(storeProductSummaryTable.storeId, storeId))
      .orderBy(desc(storeProductSummaryTable.totalRevenue))
      .limit(10);
  }

  async getRecentActivity(storeId: string) {
    return this.db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.storeId, storeId))
      .orderBy(desc(eventsTable.timestamp))
      .limit(20);
  }
}
