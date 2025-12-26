"use client";

import { ReactNode } from "react";
import { cn } from "../../lib/cn";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  widthClassName?: string;
};

export const Modal = ({ open, onClose, children, widthClassName }: ModalProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className={cn("w-full rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900", widthClassName ?? "max-w-2xl")}>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full p-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

