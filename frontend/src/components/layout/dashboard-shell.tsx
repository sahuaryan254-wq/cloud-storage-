"use client";

import { ReactNode } from "react";
import { Sidebar } from "./sidebar";

export const DashboardShell = ({
  children,
  onUploadClick,
}: {
  children: ReactNode;
  onUploadClick: () => void;
}) => {
  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-white">
      <Sidebar onUploadClick={onUploadClick} />
      <main className="flex-1 p-4 lg:p-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">{children}</div>
      </main>
    </div>
  );
};

