"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FileStack, LogOut, Upload, UserRound } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../providers/auth-provider";
import { useTheme } from "../../providers/theme-provider";
import { Switch } from "../ui/switch";

const navItems = [
  { label: "Files", href: "/dashboard", icon: FileStack },
  { label: "Profile", href: "/profile", icon: UserRound },
];

export const Sidebar = ({ onUploadClick }: { onUploadClick: () => void }) => {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="hidden w-64 flex-col border-r border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 lg:flex">
      <div className="mb-10 flex items-center gap-3">
        <div className="relative h-11 w-11 overflow-hidden rounded-xl">
          <Image
            src="/logo.png"
            alt="Cloud Uploader"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-sm text-zinc-500">Cloud Uploader</p>
          <p className="text-lg font-semibold text-zinc-900 dark:text-white">Drive Lite</p>
        </div>
      </div>

      <Button className="w-full" onClick={onUploadClick}>
        <Upload size={16} className="mr-2" />
        Upload Files
      </Button>

      <nav className="mt-8 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-200"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
              ].join(" ")}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="text-xs uppercase text-zinc-500">Theme</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-zinc-700 dark:text-zinc-200">
              {theme === "dark" ? "Dark mode" : "Light mode"}
            </span>
            <Switch checked={theme === "dark"} onChange={() => toggleTheme()} />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="text-xs uppercase text-zinc-500">Account</p>
          <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">{user?.fullName}</p>
          <Button variant="outline" className="mt-3 w-full justify-between text-sm" onClick={logout}>
            Logout
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </aside>
  );
};

