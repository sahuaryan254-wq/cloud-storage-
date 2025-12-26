import { ReactNode } from "react";
import { cn } from "../../lib/cn";

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) => (
  <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700", className)}>
    {icon && <div className="mb-4 text-4xl">{icon}</div>}
    <h3 className="text-lg font-semibold">{title}</h3>
    {description && <p className="mt-2 text-sm text-zinc-500">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

