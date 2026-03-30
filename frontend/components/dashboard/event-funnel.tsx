import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";
import { Activity, AlertCircle } from "lucide-react";
import type { OverviewResponse } from "@/interfaces/analytics";

const chartConfig = {
  pageViews: { label: "Pageviews", color: "var(--chart-1)" },
  addToCarts: { label: "Add to Cart", color: "var(--chart-2)" },
  removeFromCarts: { label: "Remove from Cart", color: "var(--chart-3)" },
  checkoutsStarted: { label: "Checkouts", color: "var(--chart-4)" },
  purchases: { label: "Purchases", color: "var(--chart-5)" },
} satisfies ChartConfig;

const PIE_COLORS = [
  "var(--color-pageViews)",
  "var(--color-addToCarts)",
  "var(--color-removeFromCarts)",
  "var(--color-checkoutsStarted)",
  "var(--color-purchases)",
];

const STEPS = [
  { key: "pageViews", label: "Page Views" },
  { key: "addToCarts", label: "Add to Cart" },
  { key: "removeFromCarts", label: "Remove from Cart" },
  { key: "checkoutsStarted", label: "Checkout" },
  { key: "purchases", label: "Purchase" },
] as const;

const DOT_COLORS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];

const BAR_COLORS = ["bg-primary", "bg-primary", "bg-primary", "bg-primary", "bg-primary"];

interface EventFunnelProps {
  data?: OverviewResponse;
  isLoading: boolean;
  isError: boolean;
}

export function EventFunnel({ data, isLoading, isError }: EventFunnelProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
        <Skeleton className="mb-4 h-4 w-36" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const values = data
    ? STEPS.map((s) => data.eventCounts[s.key])
    : [0, 0, 0, 0, 0];
  const max = Math.max(...values, 1);
  const total = values.reduce((a, b) => a + b, 0);

  const pieData = data
    ? [
        {
          name: "pageViews",
          value: data.eventCounts.pageViews,
          fill: PIE_COLORS[0],
        },
        {
          name: "addToCarts",
          value: data.eventCounts.addToCarts,
          fill: PIE_COLORS[1],
        },
        {
          name: "removeFromCarts",
          value: data.eventCounts.removeFromCarts,
          fill: PIE_COLORS[2],
        },
        {
          name: "checkoutsStarted",
          value: data.eventCounts.checkoutsStarted,
          fill: PIE_COLORS[3],
        },
        {
          name: "purchases",
          value: data.eventCounts.purchases,
          fill: PIE_COLORS[4],
        },
      ]
    : [];

  return (
    <div className="flex flex-col rounded-xl border bg-card p-5 text-card-foreground shadow-sm transition-colors hover:border-muted-foreground/30 hover:bg-accent/40">
      <div className="mb-5 flex shrink-0 items-center gap-2">
        <Activity size={16} className="text-muted-foreground" />
        <h3 className="text-sm font-semibold">Event Funnel</h3>
      </div>

      {isError ? (
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle size={16} />
            <span>Failed to load event data</span>
          </div>
        </div>
      ) : total === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No events yet
        </p>
      ) : (
        <div className="flex flex-1 flex-col justify-center">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="order-1 min-w-0 flex-1 md:order-2">
              <div className="space-y-3">
                {STEPS.map((step, i) => {
                  const value = values[i];
                  const width = max > 0 ? (value / max) * 100 : 0;

                  return (
                    <div key={step.key}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block size-2 rounded-full ${DOT_COLORS[i]}`}
                          />
                          <span className="font-medium text-muted-foreground">
                            {step.label}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-foreground">
                          {value.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${BAR_COLORS[i]}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="order-2 flex min-w-0 items-center justify-center md:order-1 md:w-50">
              <ChartContainer
                config={chartConfig}
                className="mx-auto h-45 w-45"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    outerRadius={70}
                    strokeWidth={2}
                    stroke="transparent"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <span className="text-xs text-muted-foreground">
              Overall Conversion
            </span>
            <span className="font-mono text-sm font-bold text-primary">
              {values[0] > 0
                ? `${((values[4] / values[0]) * 100).toFixed(1)}%`
                : "—"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
