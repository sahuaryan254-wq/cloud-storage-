"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardShell } from "../../../components/layout/dashboard-shell";
import { TopBar } from "../../../components/layout/top-bar";
import { FileList } from "../../../components/dashboard/file-list";
import { StatsBar } from "../../../components/dashboard/stats-bar";
import { UploadModal } from "../../../components/dashboard/upload-modal";
import { FilePreview } from "../../../components/dashboard/file-preview";
import { Button } from "../../../components/ui/button";
import { UploadCloud } from "lucide-react";
import { useAuth } from "../../../providers/auth-provider";
import { FileAPI } from "../../../lib/api";
import { FileRecord } from "../../../types";
import { Loader } from "../../../components/ui/loader";

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(
    async (params?: { search?: string; type?: string }) => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await FileAPI.list(token, params);
        setFiles(data);
        setFilteredFiles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to fetch files");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    let results = files;
    if (search.trim()) {
      const term = search.toLowerCase();
      results = results.filter(
        (file) =>
          file.originalName.toLowerCase().includes(term) ||
          file.description?.toLowerCase().includes(term)
      );
    }
    if (filter !== "ALL") {
      results = results.filter((file) => file.category === filter);
    }
    setFilteredFiles(results);
  }, [files, search, filter]);

  const handleDelete = async (file: FileRecord) => {
    if (!token) return;
    if (!confirm(`Delete ${file.originalName}?`)) return;
    try {
      await FileAPI.delete(token, file.id);
      setFiles((prev) => prev.filter((item) => item.id !== file.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleDownload = async (file: FileRecord) => {
    if (!token) return;
    try {
      const { url } = await FileAPI.download(token, file.id);
      window.open(url, "_blank");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Download failed");
    }
  };

  const heroMessage = useMemo(() => {
    if (!files.length) {
      return "Drag & drop files or use the upload button to get started.";
    }
    return `Welcome back, ${user?.fullName?.split(" ")[0] ?? "user"}!`;
  }, [files.length, user?.fullName]);

  return (
    <>
      <DashboardShell onUploadClick={() => setUploadOpen(true)}>
        <section className="rounded-3xl bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm tracking-[0.35em] uppercase text-white/70">Drive overview</p>
              <h1 className="mt-3 text-3xl font-semibold">{heroMessage}</h1>
              <p className="text-white/80">
                Filter by file type, preview documents, and download securely with one click.
              </p>
            </div>
            <Button
              onClick={() => setUploadOpen(true)}
              className="h-12 min-w-[180px] rounded-2xl bg-white/20 text-white hover:bg-white/40"
            >
              <UploadCloud size={18} className="mr-2" />
              Upload files
            </Button>
          </div>
        </section>

        <TopBar
          search={search}
          onSearchChange={setSearch}
          viewMode={viewMode}
          onViewChange={setViewMode}
          filter={filter}
          onFilterChange={setFilter}
        />

        <StatsBar files={files} />

        {loading ? (
          <Loader label="Loading files..." />
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 dark:border-red-500 dark:bg-red-500/10">
            {error}
          </div>
        ) : (
          <FileList
            files={filteredFiles}
            viewMode={viewMode}
            onPreview={setPreviewFile}
            onDownload={handleDownload}
            onDelete={handleDelete}
          />
        )}
      </DashboardShell>

      {token && (
        <UploadModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          token={token}
          onUploaded={(file) => setFiles((prev) => [file, ...prev])}
        />
      )}

      <FilePreview
        open={!!previewFile}
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        onDownload={handleDownload}
      />
    </>
  );
}

