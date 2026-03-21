import { AuthLayoutShell } from "@/components/shared/layout/auth-layout-shell";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthLayoutShell
      title="Đăng nhập hệ thống"
      description="Tiếp tục để truy cập khu vực mua hàng, nhân sự hoặc quản trị"
    >
      {children}
    </AuthLayoutShell>
  );
}
