"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AppDataProvider } from "@/context/AppDataContext";
import { isAuthenticated } from "@/lib/api";

function DashboardLayoutFallback({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dl-bg text-sm text-dl-muted">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-dl-blue border-t-transparent" />
        <span>{message}</span>
      </div>
    </div>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      const search = searchParams.toString();
      const returnTo = `${pathname}${search ? `?${search}` : ""}`;
      const redirectUrl =
        returnTo === "/login" || returnTo.startsWith("/login?")
          ? "/login"
          : `/login?redirect=${encodeURIComponent(returnTo)}`;
      router.replace(redirectUrl);
    } else {
      setCheckingAuth(false);
    }
  }, [router, pathname, searchParams]);

  if (checkingAuth) {
    return <DashboardLayoutFallback message="Verifying session…" />;
  }

  return (
    <AppDataProvider>
      <DashboardShell>{children}</DashboardShell>
    </AppDataProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardLayoutFallback message="Loading…" />}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
