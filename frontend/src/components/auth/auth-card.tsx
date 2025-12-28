"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useAuth } from "../../providers/auth-provider";

type AuthMode = "login" | "signup";

export const AuthCard = ({ mode }: { mode: AuthMode }) => {
  const { login, signup } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guidanceSteps = [
    "1️⃣  Ensure the backend is running: open a terminal, cd into `/server`, and run `npm run dev` (http://localhost:5000).",
    "2️⃣  Start the frontend from `/frontend` with `npm run dev`, then visit http://localhost:3000.",
    "3️⃣  New here? Tap “Create Account”, sign up once, and log in with those credentials.",
  ];

  const extractError = (err: unknown) => {
    if (err instanceof Error) {
      if (err.message.toLowerCase().includes("fetch")) {
        return "Cannot reach the API. Make sure the backend dev server is running on http://localhost:5000.";
      }
      return err.message;
    }
    return "Something went wrong. Please try again.";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      if (mode === "login") {
        await login({ email, password });
      } else {
        await signup({ fullName, email, password });
      }
      router.push("/dashboard");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-6 space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-500">Cloud Uploader</p>
        <h1 className="text-3xl font-semibold">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="text-sm text-zinc-500">
          {mode === "login" ? "Sign in to view and manage your files." : "Upload and manage your files securely."}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === "signup" && (
          <div>
            <label className="text-sm font-medium">Full name</label>
            <Input value={fullName} onChange={(event) => setFullName(event.target.value)} required minLength={3} />
          </div>
        )}

        <div>
          <label className="text-sm font-medium">Email</label>
          <Input value={email} onChange={(event) => setEmail(event.target.value)} required type="email" />
        </div>

        <div>
          <label className="text-sm font-medium">Password</label>
          <Input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={mode === "signup" ? 8 : 1}
            type="password"
          />
          {mode === "login" && (
            <div className="mt-2 text-right text-sm">
              <button type="button" className="text-blue-600 hover:underline">
                Forgot password?
              </button>
            </div>
          )}
        </div>

        {mode === "signup" && (
          <div>
            <label className="text-sm font-medium">Confirm password</label>
            <Input
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={8}
              type="password"
            />
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" loading={loading}>
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-zinc-500">
        {mode === "login" ? (
          <>
            No account?{" "}
            <Link href="/signup" className="font-semibold text-blue-600">
              Create one
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-blue-600">
              Sign in
            </Link>
          </>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-sm text-blue-900 dark:border-blue-500/50 dark:bg-blue-500/10 dark:text-blue-50">
        <p className="font-semibold">Need help logging in?</p>
        <ul className="mt-3 space-y-2">
          {guidanceSteps.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

