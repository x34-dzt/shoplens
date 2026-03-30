import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, AlertCircle } from "lucide-react";
import type { TopProduct } from "@/interfaces/analytics";

interface TopProductsChartProps {
  data?: TopProduct[];
  isLoading: boolean;
  isError: boolean;
}

function formatProductName(productId: string): string {
  return productId.replace("prod_", "").replace(/_/g, " ");
}

function formatCurrency(val: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(val);
}

export function TopProductsChart({
  data,
  isLoading,
  isError,
}: TopProductsChartProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
        <Skeleton className="mb-4 h-4 w-40" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  const products = data ?? [];
  const maxRevenue =
    products.length > 0 ? parseFloat(products[0].totalRevenue) : 0;

  return (
    <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm transition-colors hover:border-muted-foreground/30 hover:bg-accent/40">
      <div className="mb-6 flex items-center gap-2">
        <BarChart3 size={16} className="text-muted-foreground" />
        <h3 className="text-sm font-semibold">Top Products by Revenue</h3>
      </div>

      {isError ? (
        <div className="flex items-center justify-center py-10">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle size={16} />
            <span>Failed to load product data</span>
          </div>
        </div>
      ) : !products.length ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No product data yet
        </p>
      ) : (
        <div className="space-y-4">
          {products.map((p) => {
            const revenue = parseFloat(p.totalRevenue);
            const width = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
            return (
              <div key={p.productId}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">
                    {formatProductName(p.productId)}
                  </span>
                  <div className="flex gap-3 text-muted-foreground">
                    <span className="font-mono text-xs text-muted-foreground">
                      {p.totalOrders} {p.totalOrders === 1 ? "order" : "orders"}
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {formatCurrency(revenue)}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
