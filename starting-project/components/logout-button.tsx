"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/auth");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-sm text-foreground/60 hover:text-foreground transition-colors"
    >
      Logout
    </button>
  );
}
