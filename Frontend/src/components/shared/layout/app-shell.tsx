import Link from "next/link";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

interface NavigationItem {
  label: string;
  href: string;
}

interface AppShellProps {
  title: string;
  navItems: NavigationItem[];
  children: React.ReactNode;
  onLogout?: () => void;
}

export function AppShell({
  title,
  navItems,
  children,
  onLogout,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#f5f7f2_0%,#e7eef5_45%,#f8f4ed_100%)]">
      <header className="sticky top-0 z-20 border-b border-white/40 bg-white/45 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-heading font-semibold text-slate-800">
            {title}
          </h1>
          <nav className="hidden items-center gap-4 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-white/70"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {onLogout ? (
            <Button variant="ghost" className="gap-2" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
          ) : null}
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
