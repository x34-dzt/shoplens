"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { removeToken, getStoreId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sun, Moon, LogOut, BarChart3, Copy, Check } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function Navbar() {
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const storeId = getStoreId();

  function handleLogout() {
    removeToken();
    queryClient.clear();
    router.replace("/login");
  }

  function handleCopy() {
    if (!storeId) return;
    navigator.clipboard.writeText(storeId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-primary" />
          <span className="text-sm font-bold tracking-tighter">ShopLens</span>
          {storeId && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                {storeId}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleCopy}
                className="hidden text-muted-foreground sm:flex"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <div className="mx-1 h-4 w-px bg-border" />

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut size={16} />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
