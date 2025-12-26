"use client";

import { ChangeEvent, DragEvent, useState } from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { uploadFileWithProgress } from "../../lib/api";
import { FileRecord } from "../../types";
import { formatBytes } from "../../lib/formatters";

type UploadModalProps = {
  open: boolean;
  onClose: () => void;
  token: string;
  onUploaded: (file: FileRecord) => void;
};

export const UploadModal = ({ open, onClose, token, onUploaded }: UploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelUpload, setCancelUpload] = useState<(() => void) | null>(null);

  const reset = () => {
    setFile(null);
    setDescription("");
    setProgress(0);
    setIsUploading(false);
    setError(null);
    setCancelUpload(null);
  };

  const closeModal = () => {
    if (isUploading) return;
    reset();
    onClose();
  };

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const newFile = event.target.files?.[0];
    if (!newFile) return;
    setFile(newFile);
    setError(null);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setFile(event.dataTransfer.files[0]);
      setError(null);
      event.dataTransfer.clearData();
    }
  };

  const handleDrag = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const { promise, cancel } = uploadFileWithProgress(
      token,
      file,
      { description: description.trim() || undefined },
      {
        onProgress: (value) => setProgress(value),
      }
    );

    setCancelUpload(() => cancel);

    try {
      const uploaded = await promise;
      onUploaded(uploaded);
      reset();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
    } finally {
      setIsUploading(false);
      setCancelUpload(null);
    }
  };

  const handleCancelUpload = () => {
    cancelUpload?.();
    setIsUploading(false);
  };

  return (
    <Modal open={open} onClose={closeModal}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Upload file</h2>
          <p className="text-sm text-zinc-500">Drag & drop or select files to upload to your drive.</p>
        </div>

        <label
          onDrop={handleDrop}
          onDragOver={handleDrag}
          onDragEnter={handleDrag}
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-8 text-center transition hover:border-blue-400 hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-900/40 dark:hover:border-blue-500 dark:hover:bg-blue-500/5"
        >
          <input type="file" className="hidden" onChange={handleSelect} />
          <p className="text-lg font-semibold">{file ? file.name : "Drop file here"}</p>
          <p className="text-sm text-zinc-500">
            {file ? formatBytes(file.size) : "Supported: JPG, PNG, PDF, DOC"}
          </p>
        </label>

        <Textarea
          placeholder="Add a description or short note (optional)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={140}
        />

        {isUploading && (
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Uploading…</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-between gap-4">
          {isUploading ? (
            <Button variant="secondary" className="flex-1" onClick={handleCancelUpload}>
              Cancel upload
            </Button>
          ) : (
            <Button variant="ghost" className="flex-1" onClick={closeModal}>
              Close
            </Button>
          )}
          <Button className="flex-1" onClick={handleUpload} disabled={isUploading}>
            {isUploading ? "Uploading…" : file ? "Upload now" : "Select file"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

