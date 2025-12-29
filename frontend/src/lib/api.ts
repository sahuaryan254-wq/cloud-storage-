import { AuthUser, FileRecord } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

type ApiFetchOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  formData?: FormData;
};

type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiFailure = {
  success: false;
  message: string;
  errors?: unknown;
};

export class ApiError extends Error {
  status: number;
  payload?: ApiFailure;

  constructor(message: string, status: number, payload?: ApiFailure) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = "GET", body, token, headers, signal, formData } = options;
  const finalHeaders: Record<string, string> = headers ? { ...headers } : {};
  let payload: BodyInit | undefined;

  if (formData) {
    payload = formData;
  } else if (body !== undefined && body !== null) {
    payload = JSON.stringify(body);
    finalHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: payload,
    signal,
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const data = isJson ? ((await response.json()) as ApiSuccess<T> | ApiFailure) : null;

  if (!response.ok || !data || data.success === false) {
    const message = data && "message" in data ? data.message : response.statusText;
    const errorPayload = data?.success === false ? data : undefined;
    throw new ApiError(message ?? "Request failed", response.status, errorPayload);
  }

  return (data as ApiSuccess<T>).data;
}

export const AuthAPI = {
  login: (payload: { email: string; password: string }) =>
    apiFetch<{ token: string; user: AuthUser }>("/auth/login", {
      method: "POST",
      body: payload,
    }),
  signup: (payload: { fullName: string; email: string; password: string }) =>
    apiFetch<{ token: string; user: AuthUser }>("/auth/signup", {
      method: "POST",
      body: payload,
    }),
  forgotPassword: (payload: { email: string }) =>
    apiFetch<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: payload,
    }),
  resetPassword: (payload: { email: string; otp: string; password: string }) =>
    apiFetch<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: payload,
    }),
};

export const FileAPI = {
  list: (token: string, params?: { search?: string; type?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) {
      searchParams.set("search", params.search);
    }
    if (params?.type && params.type !== "ALL") {
      searchParams.set("type", params.type);
    }
    const queryString = searchParams.toString();
    return apiFetch<FileRecord[]>(`/files${queryString ? `?${queryString}` : ""}`, { token });
  },
  delete: (token: string, fileId: string) =>
    apiFetch<{ id: string }>(`/files/${fileId}`, {
      method: "DELETE",
      token,
    }),
  download: (token: string, fileId: string) =>
    apiFetch<{ url: string }>(`/files/${fileId}/download`, {
      token,
    }),
};

export const ProfileAPI = {
  me: (token: string) => apiFetch<AuthUser>("/profile", { token }),
  update: (token: string, payload: { fullName?: string }) =>
    apiFetch<AuthUser>("/profile", {
      method: "PATCH",
      body: payload,
      token,
    }),
  changePassword: (token: string, password: string) =>
    apiFetch<{ ok: boolean }>("/profile/password", {
      method: "PUT",
      body: { password },
      token,
    }),
  changeAvatar: (token: string, file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiFetch<AuthUser>("/profile/avatar", {
      method: "PUT",
      formData,
      token,
    });
  },
};

export type UploadProgressHandlers = {
  onProgress?: (percent: number) => void;
  onAbort?: () => void;
};

export const uploadFileWithProgress = (
  token: string,
  file: File,
  payload: { description?: string },
  handlers: UploadProgressHandlers = {}
) => {
  const formData = new FormData();
  formData.append("file", file);
  if (payload.description) {
    formData.append("description", payload.description);
  }

  const xhr = new XMLHttpRequest();

  const promise = new Promise<FileRecord>((resolve, reject) => {
    xhr.open("POST", `${API_BASE_URL}/files`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && handlers.onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        handlers.onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText) as ApiSuccess<FileRecord>;
          resolve(response.data);
        } catch (error) {
          reject(error);
        }
      } else {
        try {
          const response = JSON.parse(xhr.responseText) as ApiFailure;
          reject(new ApiError(response.message ?? "Upload failed", xhr.status, response));
        } catch {
          reject(new ApiError("Upload failed", xhr.status));
        }
      }
    };

    xhr.onerror = () => reject(new ApiError("Network error during upload", xhr.status));
    xhr.onabort = () => handlers.onAbort?.();
    xhr.send(formData);
  });

  return {
    promise,
    cancel: () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) {
        xhr.abort();
      }
    },
  };
};

