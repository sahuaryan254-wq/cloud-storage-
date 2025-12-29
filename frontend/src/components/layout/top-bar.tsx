"use client";

import { ChangeEvent } from "react";
import { Search, List, LayoutGrid, Filter } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "../../lib/cn";

type TopBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewChange: (mode: "grid" | "list") => void;
  filter: string;
  onFilterChange: (value: string) => void;
};

const filterOptions = [
  { label: "All Files", value: "ALL" },
  { label: "Images", value: "IMAGE" },
  { label: "PDF", value: "PDF" },
  { label: "Docs", value: "DOC" },
];

export const TopBar = ({
  search,
  onSearchChange,
  viewMode,
  onViewChange,
  filter,
  onFilterChange,
}: TopBarProps) => {
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <Input
          value={search}
          onChange={handleSearch}
          placeholder="Search files, descriptions..."
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1 dark:border-zinc-800">
          <Filter size={16} className="text-zinc-400" />
          <select
            className="bg-transparent text-sm focus:outline-none dark:text-white"
            value={filter}
            onChange={(event) => onFilterChange(event.target.value)}
          >
            {filterOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-zinc-200 p-1 dark:border-zinc-800">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("rounded-full", viewMode === "grid" && "bg-blue-500 text-white")}
            onClick={() => onViewChange("grid")}
            aria-label="Grid view"
          >
            <LayoutGrid size={18} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("rounded-full", viewMode === "list" && "bg-blue-500 text-white")}
            onClick={() => onViewChange("list")}
            aria-label="List view"
          >
            <List size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

