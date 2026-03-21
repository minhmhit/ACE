"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import Image from "next/image"

import { PageContainer } from "@/components/shared/common/page-container"
import { QuantitySelector } from "@/components/shared/common/quantity-selector"
import { SectionHeader } from "@/components/shared/common/section-header"
import { EmptyState } from "@/components/shared/states/empty-state"
import { ErrorState } from "@/components/shared/states/error-state"
import { LoadingState } from "@/components/shared/states/loading-state"
import { buttonVariants } from "@/components/ui/button"
import { useAddToCartMutation } from "@/features/cart/hooks/use-cart-mutations"
import { ProductGrid } from "@/features/products/components/product-grid"
import { useProductDetailQuery } from "@/features/products/hooks/use-product-detail-query"
import { useProductVariantsQuery } from "@/features/products/hooks/use-product-variants-query"
import { useProductsQuery } from "@/features/products/hooks/use-products-query"
import { resolveProductImage } from "@/features/products/utils/image"

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>()
  const productId = Number(params.id)

  const detailQuery = useProductDetailQuery(productId)
  const variantsQuery = useProductVariantsQuery(productId)
  const relatedQuery = useProductsQuery({ page: 1, limit: 6 })

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const addToCartMutation = useAddToCartMutation()

  const selectedVariant = useMemo(
    () => variantsQuery.data?.find((variant) => variant.id === selectedVariantId),
    [selectedVariantId, variantsQuery.data],
  )

  if (detailQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState />
      </PageContainer>
    )
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <PageContainer>
        <ErrorState onRetry={() => detailQuery.refetch()} />
      </PageContainer>
    )
  }

  const product = detailQuery.data
  const imageSrc = resolveProductImage(product.imageUrl)
  const price = product.price + (selectedVariant?.additionalPrice ?? 0)

  const handleAddToCart = async () => {
    await addToCartMutation.mutateAsync({
      productId: product.id,
      quantity,
      variantId: selectedVariantId,
    })
  }

  return (
    <PageContainer className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/45 bg-white/60 shadow-xl backdrop-blur-xl">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            unoptimized
            loader={({ src }) => src}
            className="object-cover"
          />
        </div>

        <div className="space-y-4 rounded-3xl border border-white/45 bg-white/60 p-6 shadow-xl backdrop-blur-xl">
          <SectionHeader title={product.name} description={product.description} />
          <p className="text-2xl font-semibold text-emerald-700">
            {price.toLocaleString("vi-VN")} đ
          </p>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Biến thể</p>
            {variantsQuery.isLoading ? (
              <p className="text-sm text-slate-500">Đang tải biến thể...</p>
            ) : null}
            {variantsQuery.isError ? (
              <p className="text-sm text-red-600">Không tải được biến thể.</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {(variantsQuery.data ?? []).map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`rounded-xl border px-3 py-2 text-sm ${selectedVariantId === variant.id ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white/70 text-slate-700"}`}
                >
                  {variant.name}{" "}
                  {variant.additionalPrice
                    ? `(+${variant.additionalPrice.toLocaleString("vi-VN")} đ)`
                    : ""}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Số lượng</p>
            <QuantitySelector value={quantity} onChange={setQuantity} min={1} max={20} />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className={buttonVariants({ variant: "default" })}
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
            >
              {addToCartMutation.isPending ? "Đang thêm..." : "Thêm vào giỏ"}
            </button>
            <Link className={buttonVariants({ variant: "outline" })} href="/cart">
              Xem giỏ hàng
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Sản phẩm liên quan"
          description="Một vài lựa chọn khác có thể phù hợp với bạn."
        />
        {relatedQuery.isLoading ? <LoadingState /> : null}
        {relatedQuery.isError ? <ErrorState onRetry={() => relatedQuery.refetch()} /> : null}
        {!relatedQuery.isLoading &&
        !relatedQuery.isError &&
        (relatedQuery.data?.data ?? []).length ? (
          <ProductGrid
            mode="grid"
            products={(relatedQuery.data?.data ?? [])
              .filter((item) => item.id !== product.id)
              .slice(0, 4)}
          />
        ) : null}
        {!relatedQuery.isLoading &&
        !relatedQuery.isError &&
        !(relatedQuery.data?.data ?? []).length ? (
          <EmptyState
            title="Chưa có sản phẩm liên quan"
            description="Vui lòng quay lại sau để xem thêm gợi ý."
          />
        ) : null}
      </section>
    </PageContainer>
  )
}
