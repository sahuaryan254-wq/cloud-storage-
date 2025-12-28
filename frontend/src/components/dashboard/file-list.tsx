"use client";

import { FileRecord } from "../../types";
import { formatBytes, formatDate } from "../../lib/formatters";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Download, Eye, Trash2 } from "lucide-react";
import { EmptyState } from "../ui/empty-state";

type FileListProps = {
  files: FileRecord[];
  viewMode: "grid" | "list";
  onPreview: (file: FileRecord) => void;
  onDownload: (file: FileRecord) => void;
  onDelete: (file: FileRecord) => void;
  loading?: boolean;
};

export const FileList = ({ files, viewMode, onPreview, onDownload, onDelete }: FileListProps) => {
  if (!files.length) {
    return (
      <EmptyState
        title="No files uploaded yet"
        description="Upload your first file to start building your cloud library."
      />
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {files.map((file) => (
          <article
            key={file.id}
            className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
          >
            <Badge>{file.category}</Badge>
            <h3 className="mt-3 line-clamp-1 text-lg font-semibold">{file.originalName}</h3>
            <p className="text-sm text-zinc-500">
              {formatBytes(file.size)} · {formatDate(file.uploadedAt)}
            </p>
            {file.description && (
              <p className="mt-3 line-clamp-2 text-sm text-zinc-500">{file.description}</p>
            )}
            <div className="mt-4 flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => onPreview(file)}>
                <Eye size={16} className="mr-2" />
                Preview
              </Button>
              <Button variant="secondary" size="icon" onClick={() => onDownload(file)}>
                <Download size={16} />
              </Button>
              <Button variant="destructive" size="icon" onClick={() => onDelete(file)}>
                <Trash2 size={16} />
              </Button>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <table className="w-full table-fixed">
        <thead className="text-left text-sm text-zinc-500">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Size</th>
            <th className="px-4 py-3 font-medium">Uploaded</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
          {files.map((file) => (
            <tr key={file.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
              <td className="truncate px-4 py-3 font-medium">{file.originalName}</td>
              <td className="px-4 py-3">
                <Badge>{file.category}</Badge>
              </td>
              <td className="px-4 py-3">{formatBytes(file.size)}</td>
              <td className="px-4 py-3">{formatDate(file.uploadedAt)}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onPreview(file)}>
                    <Eye size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDownload(file)}>
                    <Download size={16} />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => onDelete(file)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

