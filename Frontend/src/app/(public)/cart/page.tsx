"use client"

import Link from "next/link"
import Image from "next/image"

import { PageContainer } from "@/components/shared/common/page-container"
import { QuantitySelector } from "@/components/shared/common/quantity-selector"
import { SectionHeader } from "@/components/shared/common/section-header"
import { EmptyState } from "@/components/shared/states/empty-state"
import { ErrorState } from "@/components/shared/states/error-state"
import { LoadingState } from "@/components/shared/states/loading-state"
import { buttonVariants } from "@/components/ui/button"
import {
  useClearCartMutation,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from "@/features/cart/hooks/use-cart-mutations"
import { useCartQuery } from "@/features/cart/hooks/use-cart-query"
import { resolveProductImage } from "@/features/products/utils/image"

export default function CartPage() {
  const cartQuery = useCartQuery(true)
  const updateItemMutation = useUpdateCartItemMutation()
  const removeItemMutation = useRemoveCartItemMutation()
  const clearCartMutation = useClearCartMutation()

  if (cartQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState />
      </PageContainer>
    )
  }

  if (cartQuery.isError) {
    return (
      <PageContainer>
        <ErrorState onRetry={() => cartQuery.refetch()} />
      </PageContainer>
    )
  }

  const cart = cartQuery.data

  if (!cart || !cart.items.length) {
    return (
      <PageContainer>
        <SectionHeader
          title="Giỏ hàng"
          description="Theo dõi và điều chỉnh đơn hàng trước khi thanh toán."
        />
        <EmptyState
          title="Giỏ hàng đang trống"
          description="Hãy thêm sản phẩm từ trang danh sách để bắt đầu mua hàng."
        />
      </PageContainer>
    )
  }

  const handleQuantityChange = (itemId: number, quantity: number) => {
    void updateItemMutation.mutateAsync({ itemId, quantity })
  }

  const handleRemove = (itemId: number) => {
    void removeItemMutation.mutateAsync(itemId)
  }

  const handleClearCart = () => {
    void clearCartMutation.mutateAsync()
  }

  return (
    <PageContainer className="space-y-6">
      <SectionHeader
        title="Giỏ hàng"
        description="Cập nhật số lượng, kiểm tra tổng tiền và tiếp tục tới checkout."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {cart.items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-4 rounded-3xl border border-white/45 bg-white/65 p-4 shadow-xl backdrop-blur-xl sm:flex-row"
            >
              <Image
                src={resolveProductImage(item.productImage)}
                alt={item.productName ?? `Product ${item.productId}`}
                width={144}
                height={112}
                unoptimized
                loader={({ src }) => src}
                className="h-28 w-full rounded-2xl object-cover sm:w-36"
              />

              <div className="flex flex-1 flex-col gap-3">
                <h3 className="font-medium text-slate-800">
                  {item.productName ?? `Sản phẩm #${item.productId}`}
                </h3>
                <p className="text-sm text-slate-600">
                  Đơn giá: {item.unitPrice.toLocaleString("vi-VN")} đ
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <QuantitySelector
                    value={item.quantity}
                    min={1}
                    max={50}
                    onChange={(next) => handleQuantityChange(item.id, next)}
                  />
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Tạm tính</p>
                    <p className="font-semibold text-emerald-700">
                      {item.totalPrice.toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="text-sm text-rose-600 hover:underline"
                  >
                    Xóa sản phẩm
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="space-y-4 rounded-3xl border border-white/45 bg-white/65 p-5 shadow-xl backdrop-blur-xl">
          <h2 className="font-heading text-xl font-semibold">Tóm tắt đơn hàng</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Số lượng sản phẩm</span>
              <span>{cart.totalQuantity}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold text-slate-800">
              <span>Tổng tiền</span>
              <span>{cart.subtotal.toLocaleString("vi-VN")} đ</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link className={buttonVariants({ variant: "default" })} href="/checkout">
              Tiến hành checkout
            </Link>
            <button
              type="button"
              onClick={handleClearCart}
              className={buttonVariants({ variant: "outline" })}
            >
              Xóa toàn bộ giỏ
            </button>
          </div>
        </aside>
      </div>
    </PageContainer>
  )
}
