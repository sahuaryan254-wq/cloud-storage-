import { AuthCard } from "../../../components/auth/auth-card";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-zinc-900">
      <AuthCard mode="forgot-password" />
    </div>
  );
}
