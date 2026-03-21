"use client"

import { useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { PageContainer } from "@/components/shared/common/page-container"
import { SectionHeader } from "@/components/shared/common/section-header"
import { EmptyState } from "@/components/shared/states/empty-state"
import { ErrorState } from "@/components/shared/states/error-state"
import { LoadingState } from "@/components/shared/states/loading-state"
import { PaginationControls } from "@/features/products/components/pagination-controls"
import { ProductFilterBar } from "@/features/products/components/product-filter-bar"
import { ProductGrid } from "@/features/products/components/product-grid"
import { useProductsListingQuery } from "@/features/products/hooks/use-products-listing-query"
import type { Product } from "@/types/domain/product.types"

function sortProducts(items: Product[], sortBy: "name" | "price-asc" | "price-desc") {
  const copied = [...items]

  if (sortBy === "price-asc") {
    return copied.sort((a, b) => a.price - b.price)
  }

  if (sortBy === "price-desc") {
    return copied.sort((a, b) => b.price - a.price)
  }

  return copied.sort((a, b) => a.name.localeCompare(b.name))
}

export default function ProductsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const page = Number(searchParams.get("page") ?? 1)
  const limit = Number(searchParams.get("limit") ?? 12)
  const keyword = searchParams.get("keyword") ?? ""
  const sort = (searchParams.get("sort") as "name" | "price-asc" | "price-desc") ?? "name"
  const view = (searchParams.get("view") as "grid" | "list") ?? "grid"

  const [draftKeyword, setDraftKeyword] = useState(keyword)

  const productsQuery = useProductsListingQuery({ page, limit, keyword })

  const sortedItems = useMemo(
    () => sortProducts(productsQuery.data?.data ?? [], sort),
    [productsQuery.data?.data, sort],
  )

  const updateQuery = (updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
    })

    router.push(`${pathname}?${params.toString()}`)
  }

  const handleApplyFilters = () => {
    updateQuery({ keyword: draftKeyword, page: 1 })
  }

  const handleResetFilters = () => {
    setDraftKeyword("")
    router.push(pathname)
  }

  return (
    <PageContainer className="space-y-6">
      <SectionHeader
        title="Danh sách sản phẩm"
        description="Tìm kiếm, sắp xếp và khám phá các dòng cà phê phù hợp với khẩu vị của bạn."
      />

      <ProductFilterBar
        keyword={draftKeyword}
        onKeywordChange={setDraftKeyword}
        sortBy={sort}
        onSortChange={(value) => updateQuery({ sort: value })}
        viewMode={view}
        onViewModeChange={(value) => updateQuery({ view: value })}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {productsQuery.isLoading ? <LoadingState /> : null}
      {productsQuery.isError ? <ErrorState onRetry={() => productsQuery.refetch()} /> : null}

      {!productsQuery.isLoading && !productsQuery.isError && !sortedItems.length ? (
        <EmptyState
          title="Không tìm thấy sản phẩm"
          description="Thử đổi từ khóa tìm kiếm hoặc quay lại bộ lọc mặc định."
        />
      ) : null}

      {!productsQuery.isLoading && !productsQuery.isError && sortedItems.length ? (
        <>
          <ProductGrid products={sortedItems} mode={view} />
          <PaginationControls
            page={productsQuery.data?.pagination?.page ?? page}
            totalPages={productsQuery.data?.pagination?.totalPages ?? 1}
            onChangePage={(nextPage) => updateQuery({ page: nextPage })}
          />
        </>
      ) : null}
    </PageContainer>
  )
}
