"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRegister } from "@/hooks/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Eye, EyeOff, User, Lock } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { mutate: register, isPending } = useRegister();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    register(
      { username, password },
      {
        onSuccess: () => {
          toast.success("Account created!");
          router.push("/");
        },
        onError: (error) => {
          const err = error as AxiosError<{ message: string | string[] }>;
          const msg = err.response?.data?.message;
          const display = Array.isArray(msg) ? msg.join(", ") : msg || "Something went wrong";
          toast.error(display);
        },
      },
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden px-4">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 900px 600px at 20% 50%, color-mix(in oklch, var(--primary) 8%, transparent) 0%, transparent 70%), radial-gradient(ellipse 600px 900px at 80% 20%, color-mix(in oklch, var(--primary) 5%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="mb-10 flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">
          Get started with <br /> <span className="text-primary">ShopLens</span>
        </h1>
        <p className="mt-4 max-w-md text-balance text-muted-foreground">
          Real-time analytics for your store. Track revenue, conversions, and
          top products, all in one place.
        </p>
      </div>

      <form className="w-[90%] max-w-sm space-y-3" onSubmit={handleSubmit}>
        <div className="relative">
          <User
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
          />
          <Input
            id="username"
            type="text"
            placeholder="Enter your username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={3}
            autoComplete="username"
            className="px-4 py-3 pl-10 text-base rounded-xl"
          />
        </div>

        <div className="relative">
          <Lock
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
          />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            autoComplete="new-password"
            className="px-4 py-3 pl-10 pr-10 text-base rounded-xl"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Button
          type="submit"
          size="lg"
          className="mt-4 w-full text-base rounded-xl"
          disabled={isPending}
        >
          {isPending ? "Creating account..." : "Sign up"}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
