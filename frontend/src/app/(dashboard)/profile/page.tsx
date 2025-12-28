"use client";

import { useState } from "react";
import { DashboardShell } from "../../../components/layout/dashboard-shell";
import { ProfileForm } from "../../../components/profile/profile-form";
import { UploadModal } from "../../../components/dashboard/upload-modal";
import { useAuth } from "../../../providers/auth-provider";
import { ProfileAPI } from "../../../lib/api";
import { Loader } from "../../../components/ui/loader";

export default function ProfilePage() {
  const { user, token, refreshProfile } = useAuth();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader label="Loading profile..." />
      </div>
    );
  }

  const updateProfile = async (payload: { fullName?: string }) => {
    try {
      await ProfileAPI.update(token, payload);
      await refreshProfile();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update profile";
      setError(message);
      throw err;
    }
  };

  const changePassword = async (password: string) => {
    await ProfileAPI.changePassword(token, password);
  };
  const changeAvatar = async (file: File) => {
    await ProfileAPI.changeAvatar(token, file);
    await refreshProfile();
  };

  return (
    <>
      <DashboardShell onUploadClick={() => setUploadOpen(true)}>
        <section className="rounded-3xl bg-gradient-to-r from-indigo-600 to-indigo-500 p-6 text-white shadow-lg">
          <h1 className="text-3xl font-semibold">Profile & Security</h1>
          <p className="mt-2 text-white/80">
            Update your personal information, manage your password, and upload a profile image.
          </p>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/50 dark:bg-red-500/10">
            {error}
          </div>
        )}

        <ProfileForm
          user={user}
          onUpdateProfile={updateProfile}
          onChangePassword={changePassword}
          onAvatarChange={changeAvatar}
        />
      </DashboardShell>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        token={token}
        onUploaded={() => setUploadOpen(false)}
      />
    </>
  );
}

