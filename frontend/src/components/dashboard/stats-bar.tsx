import { FileRecord } from "../../types";
import { formatBytes, formatDate } from "../../lib/formatters";

const calculateStorage = (files: FileRecord[]) =>
  files.reduce((acc, file) => acc + file.size, 0);

const categoryLabels: Record<string, string> = {
  IMAGE: "Images",
  PDF: "PDFs",
  DOC: "Documents",
  OTHER: "Other",
};

export const StatsBar = ({ files }: { files: FileRecord[] }) => {
  const totalSize = calculateStorage(files);
  const lastUploaded = files[0]?.uploadedAt;
  const categoryCounts = files.reduce<Record<string, number>>((acc, file) => {
    acc[file.category] = (acc[file.category] ?? 0) + 1;
    return acc;
  }, {});

  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">Total files</p>
        <p className="mt-2 text-3xl font-semibold">{files.length}</p>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">Storage used</p>
        <p className="mt-2 text-3xl font-semibold">{formatBytes(totalSize)}</p>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">Most uploaded</p>
        <p className="mt-2 text-3xl font-semibold">
          {topCategory ? categoryLabels[topCategory[0]] : "—"}
        </p>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">Last upload</p>
        <p className="mt-2 text-3xl font-semibold">{lastUploaded ? formatDate(lastUploaded) : "—"}</p>
      </div>
    </section>
  );
};

