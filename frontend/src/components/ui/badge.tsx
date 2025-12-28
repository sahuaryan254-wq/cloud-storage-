import { ReactNode } from "react";
import { cn } from "../../lib/cn";

export const Badge = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <span className={cn("inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:bg-blue-500/10 dark:text-blue-200", className)}>
    {children}
  </span>
);

