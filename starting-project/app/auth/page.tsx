import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import AuthForm from "@/components/auth-form";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  const { mode } = await searchParams;
  const formMode = mode === "signup" ? "signup" : "login";

  return <AuthForm key={formMode} mode={formMode} />;
}
