import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import type { OverviewResponse } from "@/interfaces/analytics";

interface StatsCardsProps {
  data?: OverviewResponse;
  isLoading: boolean;
  isError: boolean;
}

function formatCurrency(val: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(val);
}

export function StatsCards({ data, isLoading, isError }: StatsCardsProps) {
  const stats = [
    {
      title: "Revenue Today",
      value: data ? formatCurrency(data.revenue.today) : undefined,
      icon: DollarSign,
    },
    {
      title: "Revenue This Week",
      value: data ? formatCurrency(data.revenue.week) : undefined,
      icon: BarChart3,
    },
    {
      title: "Revenue This Month",
      value: data ? formatCurrency(data.revenue.month) : undefined,
      icon: TrendingUp,
    },
    {
      title: "Conversion Rate",
      value: data ? `${data.conversionRate.toFixed(1)}%` : undefined,
      icon: ShoppingCart,
      color: "text-primary",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm transition-colors hover:border-muted-foreground/30 hover:bg-accent/40"
        >
          <div className="mb-3 flex items-start justify-between">
            <span className="text-[10px] font-bold text-muted-foreground">
              {stat.title}
            </span>
            <div className="rounded-lg bg-muted p-1.5 text-muted-foreground">
              <stat.icon size={14} />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-6 w-20" />
          ) : isError ? (
            <div className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle size={12} />
              <span>Error</span>
            </div>
          ) : (
            <p
              className={`font-mono text-xl font-bold tracking-tight ${stat.color ?? ""}`}
            >
              {stat.value ?? "—"}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
