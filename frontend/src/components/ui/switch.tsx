"use client";

import { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const Switch = ({ className, ...props }: SwitchProps) => (
  <label className={cn("relative inline-flex cursor-pointer items-center", className)}>
    <input type="checkbox" className="peer sr-only" {...props} />
    <span className="h-5 w-10 rounded-full bg-zinc-300 transition-colors peer-checked:bg-blue-500 dark:bg-zinc-700"></span>
    <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5"></span>
  </label>
);

