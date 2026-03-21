"use client"

import Link from "next/link"
import { Menu, ShoppingBag, UserRound } from "lucide-react"
import { useState } from "react"

import { SearchInput } from "@/components/shared/common/search-input"
import { PageContainer } from "@/components/shared/common/page-container"
import { Button } from "@/components/ui/button"

interface EndUserShellProps {
  children: React.ReactNode
}

const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/cart", label: "Giỏ hàng" },
  { href: "/orders", label: "Đơn hàng" },
  { href: "/profile", label: "Tài khoản" },
]

export function EndUserShell({ children }: EndUserShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#f4f8f6_0%,#e8eef8_50%,#fdf5ea_100%)] text-slate-800">
      <header className="sticky top-0 z-30 border-b border-white/45 bg-white/55 backdrop-blur-xl">
        <PageContainer className="py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/60 md:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/" className="text-xl font-heading font-semibold tracking-tight">
              Coffee Bot
            </Link>

            <div className="hidden flex-1 px-4 md:block">
              <SearchInput />
            </div>

            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-3 py-2 text-sm hover:bg-white/70"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-2 md:ml-0">
              <Button variant="ghost" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Giỏ hàng</span>
              </Button>
              <Button variant="ghost" size="icon">
                <UserRound className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-3 md:hidden">
            <SearchInput />
          </div>
        </PageContainer>
      </header>

      {mobileOpen ? (
        <div className="border-b border-white/45 bg-white/65 px-4 py-3 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm hover:bg-white/70"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <main className="pb-24 pt-6 md:pb-10">{children}</main>

      <footer className="border-t border-white/45 bg-white/55 py-8 backdrop-blur-xl">
        <PageContainer>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="font-heading text-lg font-semibold">Coffee Bot</h3>
              <p className="mt-2 text-sm text-slate-600">
                Cà phê bột chuẩn vị, giao nhanh, trải nghiệm mua hàng hiện đại.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Hỗ trợ</h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li>Chính sách giao hàng</li>
                <li>Chính sách đổi trả</li>
                <li>Liên hệ chăm sóc khách hàng</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">Theo dõi chúng tôi</h4>
              <p className="mt-2 text-sm text-slate-600">Facebook, TikTok, Instagram</p>
            </div>
          </div>
        </PageContainer>
      </footer>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/45 bg-white/75 backdrop-blur-xl md:hidden">
        <PageContainer className="py-2">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <Link href="/" className="rounded-lg px-2 py-2">
              Trang chủ
            </Link>
            <Link href="/products" className="rounded-lg px-2 py-2">
              Sản phẩm
            </Link>
            <Link href="/cart" className="rounded-lg px-2 py-2">
              Giỏ hàng
            </Link>
            <Link href="/profile" className="rounded-lg px-2 py-2">
              Tài khoản
            </Link>
          </div>
        </PageContainer>
      </nav>
    </div>
  )
}
