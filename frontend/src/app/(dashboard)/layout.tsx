"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../providers/auth-provider";
import { Loader } from "../../components/ui/loader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, token, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && (!user || !token)) {
      router.replace("/login");
    }
  }, [user, token, initializing, router]);

  if (initializing || !user || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <Loader label="Preparing your workspace..." />
      </div>
    );
  }

  return <>{children}</>;
}

