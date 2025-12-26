"use client";

import Image from "next/image";
import { useState, ChangeEvent, FormEvent } from "react";
import { AuthUser } from "../../types";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

type ProfileFormProps = {
  user: AuthUser;
  onUpdateProfile: (payload: { fullName?: string }) => Promise<void>;
  onChangePassword: (password: string) => Promise<void>;
  onAvatarChange: (file: File) => Promise<void>;
};

export const ProfileForm = ({
  user,
  onUpdateProfile,
  onChangePassword,
  onAvatarChange,
}: ProfileFormProps) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [password, setPassword] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.profileImageUrl ?? null);
  const [loadingField, setLoadingField] = useState<"profile" | "password" | "avatar" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (fullName === user.fullName) return;
    try {
      setLoadingField("profile");
      await onUpdateProfile({ fullName });
      setMessage("Profile updated");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update profile");
    } finally {
      setLoadingField(null);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!password) return;
    try {
      setLoadingField("password");
      await onChangePassword(password);
      setPassword("");
      setMessage("Password updated");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update password");
    } finally {
      setLoadingField(null);
    }
  };

  const handleAvatarSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setLoadingField("avatar");
      setAvatarPreview(URL.createObjectURL(file));
      await onAvatarChange(file);
      setMessage("Profile image updated");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update avatar");
      setAvatarPreview(user.profileImageUrl ?? null);
    } finally {
      setLoadingField(null);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-xl font-semibold">Profile</h2>
        <p className="text-sm text-zinc-500">Update your name and avatar.</p>
        <form className="mt-5 space-y-4" onSubmit={handleProfileSubmit}>
          <div className="flex items-center gap-4">
            <label className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar preview"
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized
                />
              ) : (
                "Upload"
              )}
              <input type="file" className="absolute inset-0 cursor-pointer opacity-0" onChange={handleAvatarSelect} />
            </label>
            <div>
              <p className="text-sm font-medium">{user.email}</p>
              <p className="text-xs text-zinc-500">Tap circle to upload picture</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Full name</label>
            <Input value={fullName} onChange={(event) => setFullName(event.target.value)} minLength={3} required />
          </div>
          <Button type="submit" loading={loadingField === "profile"}>
            Save changes
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-xl font-semibold">Security</h2>
        <p className="text-sm text-zinc-500">Update your password frequently to keep your account safe.</p>
        <form className="mt-5 space-y-4" onSubmit={handlePasswordSubmit}>
          <div>
            <label className="text-sm font-medium">New password</label>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
          </div>
          <Button type="submit" loading={loadingField === "password"}>
            Update password
          </Button>
        </form>
        {message && <p className="mt-4 text-sm text-blue-600">{message}</p>}
      </section>
    </div>
  );
};

