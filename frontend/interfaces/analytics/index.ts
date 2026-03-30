export interface Revenue {
  today: number;
  week: number;
  month: number;
}

export interface EventCounts {
  pageViews: number;
  addToCarts: number;
  removeFromCarts: number;
  checkoutsStarted: number;
  purchases: number;
}

export interface OverviewResponse {
  revenue: Revenue;
  conversionRate: number;
  eventCounts: EventCounts;
}

export interface TopProduct {
  storeId: string;
  productId: string;
  totalRevenue: string;
  totalOrders: number;
}

export interface RecentEvent {
  eventId: string;
  storeId: string;
  eventType:
    | "page_view"
    | "add_to_cart"
    | "remove_from_cart"
    | "checkout_started"
    | "purchase";
  timestamp: string;
  data: Record<string, unknown>;
}
