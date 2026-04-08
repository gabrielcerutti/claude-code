import Link from "next/link";
import LogoutButton from "@/components/logout-button";

export default function Header() {
  return (
    <header className="border-b border-foreground/10">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight">
          NextNotes
        </Link>
        <LogoutButton />
      </nav>
    </header>
  );
}
