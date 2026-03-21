import { EndUserShell } from "@/components/shared/shell/end-user-shell"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <EndUserShell>{children}</EndUserShell>
}
