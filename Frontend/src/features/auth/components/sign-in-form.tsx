"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { APP_ROUTES } from "@/constants/routes"
import { useLogin } from "@/features/auth/hooks/use-login"
import { loginSchema, type LoginSchema } from "@/features/auth/schemas/login.schema"

export function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get("next")

  const loginMutation = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = handleSubmit(async (values) => {
    const result = await loginMutation.mutateAsync(values)
    const redirectTarget =
      nextPath ?? (result.role.code === "ADMIN" ? APP_ROUTES.adminDashboard : APP_ROUTES.home)

    router.replace(redirectTarget)
  })

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <Input id="email" type="email" placeholder="you@coffee.local" {...register("email")} />
        {errors.email ? <p className="text-sm text-red-600">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="password">
          Mật khẩu
        </label>
        <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
        {errors.password ? <p className="text-sm text-red-600">{errors.password.message}</p> : null}
      </div>

      <Button className="w-full" type="submit" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>

      {loginMutation.isError ? (
        <p className="text-sm text-red-600">Đăng nhập thất bại. Vui lòng thử lại.</p>
      ) : null}
    </form>
  )
}
