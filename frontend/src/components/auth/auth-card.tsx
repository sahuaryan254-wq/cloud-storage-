"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useAuth } from "../../providers/auth-provider";
import { AuthAPI } from "../../lib/api";

type AuthMode = "login" | "signup" | "forgot-password";

export const AuthCard = ({ mode }: { mode: AuthMode }) => {
  const { login, signup } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1); // 1: Email, 2: OTP + Password
  const [otp, setOtp] = useState("");

  const guidanceSteps = [
    "1️⃣ Enter your registered email and password to continue.",
    "2️⃣ New here? Click “Create Account” to sign up in just a few steps.",
    "3️⃣ Forgot your password? Use “Forgot Password” to reset it easily.",
  ];

  const extractError = (err: unknown) => {
    if (err instanceof Error) {
      if (err.message.toLowerCase().includes("fetch")) {
        return "Unable to connect to the server. Please ensure the backend is running.";
      }
      return err.message; // Now backend returns user-friendly messages
    }
    return "An unexpected error occurred. Please try again.";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (mode === "forgot-password" && step === 2 && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      if (mode === "login") {
        await login({ email, password });
        router.push("/dashboard");
      } else if (mode === "signup") {
        await signup({ fullName, email, password });
        router.push("/dashboard");
      } else if (mode === "forgot-password") {
        // Dynamically import API to avoid circular deps if needed, or just use it
        // const { AuthAPI } = require("../../lib/api"); // AuthAPI is now imported directly

        if (step === 1) {
          // Request OTP
          await AuthAPI.forgotPassword({ email });
          setSuccess("OTP sent to your email.");
          setStep(2);
        } else {
          // Reset Password
          await AuthAPI.resetPassword({ email, otp, password });
          setSuccess("Password reset successfully. Redirecting...");
          setPassword("");
          setConfirmPassword("");
          setOtp("");
          // Optional: Redirect to login after delay
          setTimeout(() => router.push("/login"), 2000);
        }
      }
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
        <h1 className="text-3xl font-semibold">
          {mode === "login"
            ? "Welcome back"
            : mode === "signup"
              ? "Create your account"
              : "Reset Password"}
        </h1>
        <p className="text-sm text-zinc-500">
          {mode === "login"
            ? "Sign in to view and manage your files."
            : mode === "signup"
              ? "Upload and manage your files securely."
              : step === 1 ? "Enter your email to receive an OTP." : "Enter OTP and your new password."}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === "signup" && (
          <div>
            <label className="text-sm font-medium">Full name</label>
            <Input value={fullName} onChange={(event) => setFullName(event.target.value)} required minLength={3} />
          </div>
        )}

        {/* Email Field - Always visible except step 2 logic could hide it, but good to keep for reference or disable */}
        <div className={mode === "forgot-password" && step === 2 ? "hidden" : ""}>
          <label className="text-sm font-medium">Email</label>
          <Input value={email} onChange={(event) => setEmail(event.target.value)} required type="email" disabled={mode === "forgot-password" && step === 2} />
        </div>

        {/* Forgot Password Step 2: OTP */}
        {mode === "forgot-password" && step === 2 && (
          <div>
            <label className="text-sm font-medium">OTP Code</label>
            <Input value={otp} onChange={(event) => setOtp(event.target.value)} required maxLength={6} placeholder="Enter 6-digit OTP" />
          </div>
        )}

        {/* Password Field - Login, Signup, or Forgot Password Step 2 */}
        {(mode !== "forgot-password" || step === 2) && (
          <div>
            <label className="text-sm font-medium">{mode === "forgot-password" ? "New Password" : "Password"}</label>
            <Input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={mode === "signup" ? 8 : 1}
              type="password"
            />
            {mode === "login" && (
              <div className="mt-2 text-right text-sm">
                <Link href="/forgot-password">
                  <button type="button" className="text-blue-600 hover:underline">
                    Forgot password?
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}

        {(mode === "signup" || (mode === "forgot-password" && step === 2)) && (
          <div>
            <label className="text-sm font-medium">Confirm {mode === "forgot-password" ? "New " : ""}password</label>
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
        {success && <p className="text-sm text-green-600">{success}</p>}

        <Button type="submit" className="w-full" loading={loading}>
          {mode === "login"
            ? "Sign in"
            : mode === "signup"
              ? "Create account"
              : mode === "forgot-password" && step === 1
                ? "Send OTP"
                : "Reset Password"}
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
        ) : mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-blue-600">
              Sign in
            </Link>
          </>
        ) : (
          <Link href="/login" className="font-semibold text-blue-600">
            Back to login
          </Link>
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

