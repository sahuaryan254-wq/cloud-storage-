export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  profileImageUrl?: string | null;
};

export type FileCategory = "IMAGE" | "PDF" | "DOC" | "OTHER";

export type FileRecord = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  s3Url: string;
  uploadedAt: string;
  category: FileCategory;
  description?: string | null;
};

export type ApiListResponse<T> = T[];

