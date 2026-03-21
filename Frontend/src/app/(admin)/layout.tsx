import { AppShell } from "@/components/shared/layout/app-shell"
import { ProtectedLayout } from "@/components/shared/layout/protected-layout"
import { ADMIN_ROLES } from "@/constants/roles"

const adminNav = [
  { label: "Dashboard", href: "/admin" },
  { label: "Sản phẩm", href: "/admin/catalog" },
  { label: "Đơn hàng", href: "/admin/orders" },
  { label: "Nhân sự", href: "/admin/hr" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout requiredRoles={ADMIN_ROLES}>
      <AppShell title="Admin Backoffice" navItems={adminNav}>
        {children}
      </AppShell>
    </ProtectedLayout>
  )
}
