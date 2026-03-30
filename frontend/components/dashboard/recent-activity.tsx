import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle } from "lucide-react";
import type { RecentEvent } from "@/interfaces/analytics";

interface RecentActivityProps {
  data?: RecentEvent[];
  isLoading: boolean;
  isError: boolean;
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function productName(data: Record<string, unknown>): string {
  return data.productId
    ? (data.productId as string).replace("prod_", "").replace(/_/g, " ")
    : "—";
}

function formatDetails(event: RecentEvent): string {
  const d = event.data;
  switch (event.eventType) {
    case "purchase": {
      const amount = d.amount != null ? `$${Number(d.amount).toFixed(2)}` : "";
      const name = productName(d);
      return amount ? `${name} — ${amount}` : name;
    }
    case "add_to_cart": {
      const price = d.price != null ? `$${Number(d.price).toFixed(2)}` : "";
      const name = productName(d);
      return price ? `${name} — ${price}` : name;
    }
    case "checkout_started":
      return d.cartTotal != null
        ? `Cart total: $${Number(d.cartTotal).toFixed(2)}`
        : productName(d);
    case "remove_from_cart":
      return productName(d);
    case "page_view":
      return (d.url as string) || productName(d);
    default:
      return "—";
  }
}

function EventBadge({ type }: { type: string }) {
  const base = "inline-block rounded-md px-2 py-0.5 text-[11px] font-medium";

  const styles: Record<string, string> = {
    page_view: "bg-chart-1/20 text-chart-1",
    add_to_cart: "bg-chart-2/20 text-chart-2",
    remove_from_cart: "bg-chart-3/20 text-chart-3",
    checkout_started: "bg-chart-4/20 text-chart-4",
    purchase: "bg-chart-5/20 text-chart-5",
  };

  const labels: Record<string, string> = {
    purchase: "Purchase",
    checkout_started: "Checkout",
    add_to_cart: "Add to Cart",
    remove_from_cart: "Removed",
    page_view: "Page View",
  };

  return (
    <span className={`${base} ${styles[type] ?? styles.page_view}`}>
      {labels[type] ?? type}
    </span>
  );
}

export function RecentActivity({
  data,
  isLoading,
  isError,
}: RecentActivityProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="border-b px-5 py-4">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-2 p-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm transition-colors hover:border-muted-foreground/30 hover:bg-accent/40">
      <div className="border-b px-5 py-4">
        <h3 className="text-sm font-semibold">Recent Activity</h3>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Showing last {data?.length ?? 0} events
        </p>
      </div>

      {isError ? (
        <div className="flex items-center justify-center p-10">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle size={16} />
            <span>Failed to load recent activity</span>
          </div>
        </div>
      ) : !data?.length ? (
        <div className="p-10 text-center text-sm italic text-muted-foreground">
          No recent activity recorded.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-muted hover:bg-muted/50">
                <TableHead className="px-5 py-3 text-[11px] font-semibold">
                  Event
                </TableHead>
                <TableHead className="px-5 py-3 text-[11px] font-semibold">
                  Details
                </TableHead>
                <TableHead className="px-5 py-3 text-right text-[11px] font-semibold">
                  Time
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((event) => (
                <TableRow key={event.eventId}>
                  <TableCell className="px-5 py-3">
                    <EventBadge type={event.eventType} />
                  </TableCell>
                  <TableCell className="px-5 py-3 font-mono text-xs font-medium text-muted-foreground">
                    {formatDetails(event)}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-right font-mono text-[11px] text-muted-foreground">
                    {timeAgo(event.timestamp)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
