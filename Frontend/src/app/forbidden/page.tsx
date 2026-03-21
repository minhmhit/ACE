import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

export default function ForbiddenPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-heading font-semibold text-slate-800">
        Không có quyền truy cập
      </h1>
      <p className="text-slate-600">Tài khoản của bạn không có quyền với khu vực này.</p>
      <Link className={buttonVariants({ variant: "default" })} href="/">
        Quay về trang chủ
      </Link>
    </div>
  )
}
