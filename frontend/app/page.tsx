"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { EventFunnel } from "@/components/dashboard/event-funnel";
import { TopProductsChart } from "@/components/dashboard/top-products-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import {
  useOverview,
  useTopProducts,
  useRecentActivity,
} from "@/hooks/analytics";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const token = getToken();

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [router, token]);

  const overview = useOverview({ enabled: !!token });
  const topProducts = useTopProducts({ enabled: !!token });
  const recentActivity = useRecentActivity({ enabled: !!token });

  useEffect(() => {
    if (overview.isError) toast.error("Failed to load overview data");
  }, [overview.isError]);

  useEffect(() => {
    if (topProducts.isError) toast.error("Failed to load top products");
  }, [topProducts.isError]);

  useEffect(() => {
    if (recentActivity.isError) toast.error("Failed to load recent activity");
  }, [recentActivity.isError]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <header className="mb-8">
          <h1 className="text-xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time performance metrics for your store.
          </p>
        </header>
        <div className="space-y-6">
          <StatsCards
            data={overview.data}
            isLoading={overview.isLoading}
            isError={overview.isError}
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <EventFunnel
              data={overview.data}
              isLoading={overview.isLoading}
              isError={overview.isError}
            />
            <TopProductsChart
              data={topProducts.data}
              isLoading={topProducts.isLoading}
              isError={topProducts.isError}
            />
          </div>
          <RecentActivity
            data={recentActivity.data}
            isLoading={recentActivity.isLoading}
            isError={recentActivity.isError}
          />
        </div>
      </main>
    </div>
  );
}
