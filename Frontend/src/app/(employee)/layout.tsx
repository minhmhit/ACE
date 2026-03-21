import { AppShell } from "@/components/shared/layout/app-shell";
import { ProtectedLayout } from "@/components/shared/layout/protected-layout";
import { EMPLOYEE_ROLES } from "@/constants/roles";

const employeeNav = [
  { label: "Bảng điều khiển", href: "/employee" },
  { label: "Chấm công", href: "/employee/attendance" },
  { label: "Nghỉ phép", href: "/employee/leave" },
];

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout requiredRoles={EMPLOYEE_ROLES}>
      <AppShell title="Employee Area" navItems={employeeNav}>
        {children}
      </AppShell>
    </ProtectedLayout>
  );
}
