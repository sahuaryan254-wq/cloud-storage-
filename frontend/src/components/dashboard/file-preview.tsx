"use client";

import Image from "next/image";
import { Modal } from "../ui/modal";
import { FileRecord } from "../../types";
import { formatBytes, formatDate } from "../../lib/formatters";
import { Button } from "../ui/button";
import { FileDown } from "lucide-react";

type FilePreviewProps = {
  open: boolean;
  file: FileRecord | null;
  onClose: () => void;
  onDownload: (file: FileRecord) => void;
};

const getPreview = (file: FileRecord | null) => {
  if (!file) return null;

  // Convert absolute backend URL to relative proxy URL
  // e.g. http://localhost:5000/storage/xyz -> /storage/xyz
  const getProxyUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.pathname;
    } catch {
      return url;
    }
  };

  const previewUrl = getProxyUrl(file.s3Url);

  if (file.mimeType.startsWith("image/")) {
    return (
      <div className="relative h-72 w-full overflow-hidden rounded-xl bg-black/5 dark:bg-white/5">
        <Image
          src={previewUrl}
          alt={file.originalName}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 800px"
          unoptimized
        />
      </div>
    );
  }
  if (file.mimeType === "application/pdf") {
    return (
      <iframe
        src={previewUrl}
        title={file.originalName}
        className="h-72 w-full rounded-xl border border-zinc-200 dark:border-zinc-800"
      />
    );
  }
  return (
    <div className="flex h-72 w-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 text-sm text-zinc-500 dark:border-zinc-700">
      <p>No preview available</p>
    </div>
  );
};

export const FilePreview = ({ open, file, onClose, onDownload }: FilePreviewProps) => {
  if (!file) return null;
  return (
    <Modal open={open} onClose={onClose} widthClassName="max-w-3xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{file.originalName}</h2>
            <p className="text-sm text-zinc-500">
              {file.category} · {formatBytes(file.size)} · Uploaded {formatDate(file.uploadedAt)}
            </p>
          </div>
          <Button className="w-full lg:w-auto" onClick={() => onDownload(file)}>
            <FileDown size={16} className="mr-2" />
            Download
          </Button>
        </div>
        {getPreview(file)}
        {file.description && (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900">
            <p>{file.description}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

