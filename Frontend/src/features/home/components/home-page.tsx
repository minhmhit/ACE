"use client"

import Link from "next/link"

import { GlassCard } from "@/components/shared/common/glass-card"
import { PageContainer } from "@/components/shared/common/page-container"
import { SectionHeader } from "@/components/shared/common/section-header"
import { EmptyState } from "@/components/shared/states/empty-state"
import { ErrorState } from "@/components/shared/states/error-state"
import { LoadingState } from "@/components/shared/states/loading-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  useFeaturedProductsQuery,
  useNewestProductsQuery,
} from "@/features/products/hooks/use-home-products-query"
import { productsService } from "@/services/products.service"
import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/constants/query-keys"

function ProductGridSection({
  title,
  description,
  loading,
  error,
  items,
}: {
  title: string
  description: string
  loading: boolean
  error: boolean
  items: Array<{ id: number; name: string; price: number }>
}) {
  return (
    <section className="space-y-4">
      <SectionHeader title={title} description={description} />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState /> : null}
      {!loading && !error && !items.length ? (
        <EmptyState
          title="Chưa có sản phẩm"
          description="Vui lòng quay lại sau để xem các dòng cà phê mới."
        />
      ) : null}
      {!loading && !error && items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((product) => (
            <GlassCard key={product.id} className="space-y-3 p-4">
              <Badge variant="secondary">{product.id}</Badge>
              <h3 className="line-clamp-2 font-medium text-slate-800">{product.name}</h3>
              <p className="text-sm text-slate-600">{product.price.toLocaleString("vi-VN")} đ</p>
              <Button asChild className="w-full">
                <Link href={`/products/${product.id}`}>Xem chi tiết</Link>
              </Button>
            </GlassCard>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export function HomePage() {
  const featuredQuery = useFeaturedProductsQuery(8)
  const newestQuery = useNewestProductsQuery(8)
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.list,
    queryFn: () => productsService.getList({ page: 1, limit: 6 }),
    staleTime: 5 * 60 * 1000,
  })

  const featuredItems = featuredQuery.data?.data ?? []
  const newestItems = newestQuery.data?.data ?? []

  return (
    <PageContainer className="space-y-10">
      <section className="grid gap-5 md:grid-cols-[1.3fr_1fr]">
        <GlassCard className="space-y-4 p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Coffee OOAD</p>
          <h1 className="text-3xl font-heading font-semibold text-slate-800 md:text-5xl">
            Cà phê bột nguyên chất cho mọi phong cách thưởng thức
          </h1>
          <p className="max-w-2xl text-slate-600">
            Chọn hương vị phù hợp với gu của bạn, đặt nhanh trong vài bước và theo dõi đơn hàng rõ
            ràng.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/products">Mua ngay</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/products">Khám phá sản phẩm</Link>
            </Button>
          </div>
        </GlassCard>

        <GlassCard className="space-y-3 p-6">
          <h2 className="font-heading text-2xl font-semibold">Lý do chọn chúng tôi</h2>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>Hạt cà phê tuyển chọn, rang mới theo mẻ.</li>
            <li>Đóng gói tiêu chuẩn giữ hương lâu.</li>
            <li>Hỗ trợ tư vấn gu vị theo từng nhu cầu.</li>
            <li>Thanh toán linh hoạt: COD, MOMO, VNPAY.</li>
          </ul>
        </GlassCard>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Danh mục nổi bật"
          title="Bắt đầu từ gu cà phê của bạn"
          description="Gợi ý nhanh các nhóm sản phẩm được quan tâm nhiều nhất."
        />
        {categoriesQuery.isLoading ? <LoadingState /> : null}
        {categoriesQuery.isError ? <ErrorState /> : null}
        {!categoriesQuery.isLoading && !categoriesQuery.isError ? (
          <div className="grid gap-4 md:grid-cols-3">
            {(categoriesQuery.data?.data ?? []).slice(0, 3).map((item) => (
              <GlassCard key={item.id} className="p-5">
                <h3 className="font-medium text-slate-800">{item.name}</h3>
                <p className="mt-1 text-sm text-slate-600">Khám phá ngay các lựa chọn phù hợp.</p>
              </GlassCard>
            ))}
          </div>
        ) : null}
      </section>

      <ProductGridSection
        title="Sản phẩm nổi bật"
        description="Top lựa chọn được đặt nhiều trong tuần này."
        loading={featuredQuery.isLoading}
        error={featuredQuery.isError}
        items={featuredItems}
      />

      <ProductGridSection
        title="Sản phẩm mới"
        description="Các dòng cà phê mới lên kệ gần đây."
        loading={newestQuery.isLoading}
        error={newestQuery.isError}
        items={newestItems}
      />

      <section className="grid gap-4 md:grid-cols-2">
        <GlassCard className="p-6">
          <h3 className="font-heading text-xl font-semibold">Khách hàng nói gì?</h3>
          <p className="mt-3 text-sm text-slate-600">
            "Đặt hàng nhanh, hương vị ổn định, đóng gói đẹp. Tôi đã mua lại 4 lần trong tháng." -
            Anh Minh, Q.3
          </p>
        </GlassCard>
        <GlassCard className="p-6">
          <h3 className="font-heading text-xl font-semibold">Sẵn sàng chọn vị cà phê hôm nay?</h3>
          <p className="mt-3 text-sm text-slate-600">
            Vào trang sản phẩm để lọc theo mức rang, vị chua, vị đắng và mức giá phù hợp.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/products">Đi tới trang mua hàng</Link>
          </Button>
        </GlassCard>
      </section>
    </PageContainer>
  )
}
