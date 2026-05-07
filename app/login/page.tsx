import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6"><AuthForm mode="login" /></main>;
}
