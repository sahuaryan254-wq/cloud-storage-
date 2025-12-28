"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../providers/auth-provider";
import { Loader } from "../../components/ui/loader";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && user) {
      router.replace("/dashboard");
    }
  }, [user, initializing, router]);

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <Loader label="Loading..." />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#dbeafe,_#eff6ff,_#fff)] px-4 py-12 dark:bg-zinc-900">
      {children}
    </div>
  );
}

