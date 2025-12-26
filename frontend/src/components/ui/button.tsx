"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "ghost" | "destructive" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
          variant === "default" &&
            "bg-blue-600 text-white shadow hover:bg-blue-500 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-400",
          variant === "secondary" && "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100",
          variant === "ghost" && "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800",
          variant === "destructive" && "bg-red-500 text-white hover:bg-red-600",
          variant === "outline" &&
            "border border-zinc-300 bg-transparent hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800",
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-9 rounded-md px-3",
          size === "lg" && "h-11 rounded-md px-6 text-base",
          size === "icon" && "h-10 w-10",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? "Please wait..." : children}
      </button>
    );
  }
);

Button.displayName = "Button";

